import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import sketchDataUri from "@/assets/room-layout.png?inline";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { aiFavorites, favoritesSchema } from "./taste";
import { ROOM_PALETTES, personalRoomPrompt, roomVibe } from "./personal-room";

const paletteIds = ROOM_PALETTES.map((p) => p.id);
const inputSchema = z
  .object({
    paletteId: z.string().refine((id) => paletteIds.some((p) => p === id), "Unknown room palette"),
    vibeIds: z
      .array(z.string())
      .max(3)
      .refine(
        (ids) => new Set(ids).size === ids.length && ids.every((id) => roomVibe(id)),
        "Unknown vibe",
      ),
    aiConsent: z.literal(true),
  })
  .strict();

const BUCKET = "go-private-rooms";

export const getPersonalRoom = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: saved, error } = await context.supabase
      .from("go_personal_rooms")
      .select("palette_id,vibe_ids,image_path")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error("Your room could not be loaded.");
    if (!saved) return null;
    const { data: signed, error: signError } = saved.image_path
      ? await context.supabase.storage.from(BUCKET).createSignedUrl(saved.image_path, 3600)
      : { data: null, error: null };
    return {
      paletteId: saved.palette_id,
      vibeIds: Array.isArray(saved.vibe_ids)
        ? saved.vibe_ids.filter((v): v is string => typeof v === "string")
        : [],
      imageUrl: signError ? null : (signed?.signedUrl ?? null),
    };
  });

export const generatePersonalRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    // The room request requires its own explicit opt-in, even if another AI consent exists.
    const key = process.env["GEMINI_API_KEY"];
    if (!key)
      throw new Error(
        "AI image generation is not configured. Your original sketch remains available.",
      );

    const { data: allowed, error: limitError } = await context.supabase.rpc("go_take_request", {
      p_bucket: "room",
    });
    if (limitError)
      throw new Error(
        "Room generation is not ready. Apply the go_personal_rooms database migration.",
      );
    if (!allowed) throw new Error("You have used your two room creations for today.");

    const { data: preferences, error: prefError } = await context.supabase
      .from("go_preferences")
      .select("favorites")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (prefError) throw new Error("Your cultural preferences could not be read.");
    const favorites = preferences
      ? aiFavorites(favoritesSchema.parse(preferences.favorites))
      : { movies: [], music: [], books: [], style: [] };
    const variationToken = crypto.randomUUID(); // Random visual variation, NEVER a user identifier.
    const prompt = personalRoomPrompt({
      paletteId: data.paletteId as (typeof ROOM_PALETTES)[number]["id"],
      vibeIds: data.vibeIds,
      culturalTitles: favorites as Record<string, string[]>,
      variationToken,
    });
    const encoded = sketchDataUri.split(",")[1];
    if (!encoded) throw new Error("The room sketch reference is missing.");
    const model = process.env["GO_ROOM_IMAGE_MODEL"] || "gemini-2.5-flash-image";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: encoded } }],
            },
          ],
          generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
        }),
        signal: AbortSignal.timeout(90000),
      },
    );
    if (!response.ok)
      throw new Error(
        `Google could not generate your room (HTTP ${response.status}). Try again later.`,
      );
    const result = (await response.json()) as {
      candidates?: {
        content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
      }[];
    };
    const art = result.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
    const mimeType = art?.mimeType;
    if (!art?.data || !mimeType || !["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
      throw new Error("The image model did not return a valid room illustration.");
    }
    const bytes = Uint8Array.from(Array.from(atob(art.data), (c) => c.charCodeAt(0)));
    if (bytes.length > 4_194_304) throw new Error("The generated room image is too large to save.");
    const extension =
      mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
    const path = `${context.userId}/room-${variationToken}.${extension}`;

    const { error: uploadError } = await context.supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: mimeType, upsert: false });
    if (uploadError) throw new Error("The room image could not be saved privately.");
    const { error: saveError } = await context.supabase.from("go_personal_rooms").upsert({
      user_id: context.userId,
      palette_id: data.paletteId,
      vibe_ids: data.vibeIds,
      image_path: path,
      updated_at: new Date().toISOString(),
    });
    if (saveError) {
      await context.supabase.storage.from(BUCKET).remove([path]);
      throw new Error("Your new room could not be linked to your account.");
    }
    const { data: signed, error: signError } = await context.supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);
    if (signError || !signed)
      throw new Error("The room was saved, but a private preview could not be created.");
    return { paletteId: data.paletteId, vibeIds: data.vibeIds, imageUrl: signed.signedUrl };
  });
