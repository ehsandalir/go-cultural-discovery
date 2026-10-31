import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { VIBES } from './vibes';

const moduleSchema = z.enum(['watch','listen','read']);
const languageSchema = z.enum(['fa','en','fr','es','de']);
const httpsUrl = z.string().url().max(1000).refine(s => s.startsWith('https://')).nullable().optional();
const externalSchema = z.object({
  module: moduleSchema,
  title: z.string().trim().min(1).max(250),
  creator: z.string().trim().max(180).default(''),
  provider: z.enum(['google','google-books','tmdb','spotify','manual']),
  providerId: z.string().max(180).nullable().optional(),
  sourceUrl: httpsUrl,
  coverUrl: httpsUrl,
  language: languageSchema
}).strict();

export type OnlineHit = { title: string; creator: string; provider: 'google'|'google-books'|'tmdb'|'spotify'; providerId: string | null; sourceUrl: string | null; coverUrl: string | null };
const safeUrl = (url: unknown): string | null => typeof url === 'string' && url.startsWith('https://') && url.length < 1000 ? url : null;

export const searchOnlineWorks = createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({module:moduleSchema, query:z.string().trim().min(2).max(100), language:languageSchema}).strict().parse(input))
  .handler(async ({data,context}): Promise<{items: OnlineHit[], message: string}> => {
    const { data: allowed, error: limitError } = await context.supabase.rpc('go_take_request',{p_bucket:'catalog'});
    if(limitError || !allowed) return {items:[],message:'Search limit reached. Try again in a minute.'};
    try {
      const googleKey=process.env['GOOGLE_SEARCH_API_KEY'];
      const cx=process.env['GOOGLE_CSE_ID'];
      if(googleKey && cx) {
        const url=new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key',googleKey);
        url.searchParams.set('cx',cx);
        url.searchParams.set('q',data.query + (data.module==='watch'?' film':data.module==='read'?' book':' song music'));
        url.searchParams.set('num','9');
        url.searchParams.set('safe','active');
        url.searchParams.set('hl',data.language);
        const r=await fetch(url);
        if(!r.ok) return {items:[],message:`Google Search returned ${r.status}. Check API quota or configuration.`};
        const raw=await r.json() as {items?:Array<{title?:string;link?:string;pagemap?:{cse_image?:{src?:string}[]}}>} ;
        return {items:(raw.items??[]).filter(i=>i.title).map(i=>({
          title:i.title!.slice(0,250),creator:'',provider:'google',providerId:null,sourceUrl:safeUrl(i.link),coverUrl:safeUrl(i.pagemap?.cse_image?.[0]?.src)
        })),message:raw.items?.length?'':'No results found.'};
      }
      // Provider-native fallback is explicitly labelled; not represented as Google Search.
      if(data.module==='read') {
        const url=new URL('https://www.googleapis.com/books/v1/volumes');
        url.searchParams.set('q',data.query);url.searchParams.set('maxResults','9');
        url.searchParams.set('printType','books');
        url.searchParams.set('langRestrict',data.language);
        const key=process.env['GOOGLE_BOOKS_API_KEY']; if(key) url.searchParams.set('key',key);
        const r=await fetch(url); if(!r.ok) throw new Error('Google Books search is unavailable');
        const b=await r.json() as {items?:Array<{id:string;volumeInfo?:{title?:string;authors?:string[];infoLink?:string;imageLinks?:{thumbnail?:string}}}>};
        return {items:(b.items??[]).filter(x=>x.volumeInfo?.title).map(x=>({
          title:x.volumeInfo!.title!.slice(0,250),creator:(x.volumeInfo?.authors??[]).join(', ').slice(0,180),provider:'google-books' as const,providerId:x.id,sourceUrl:safeUrl(x.volumeInfo?.infoLink),coverUrl:safeUrl(x.volumeInfo?.imageLinks?.thumbnail?.replace(/^http:/,'https:'))
        })),message:'Google Custom Search is not configured; showing Google Books results.'};
      }
      if(data.module==='watch') {
        const token=process.env['TMDB_READ_ACCESS_TOKEN'];
        if(!token) return {items:[],message:'Configure GOOGLE_SEARCH_API_KEY and GOOGLE_CSE_ID for Google Search, or TMDB token.'};
        const url=new URL('https://api.themoviedb.org/3/search/movie');
        url.searchParams.set('query',data.query);url.searchParams.set('include_adult','false');
        const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok) throw new Error('TMDB search is unavailable');
        const b=await r.json() as {results?:Array<{id:number;title:string;poster_path?:string}>};
        return {items:(b.results??[]).slice(0,9).map(x=>({title:x.title.slice(0,250),creator:'',provider:'tmdb',providerId:String(x.id),sourceUrl:`https://www.themoviedb.org/movie/${x.id}`,coverUrl:x.poster_path?`https://image.tmdb.org/t/p/w342${x.poster_path}`:null})),message:'Google Custom Search is not configured; showing TMDB results.'};
      }
      const id=process.env['SPOTIFY_CLIENT_ID'],secret=process.env['SPOTIFY_CLIENT_SECRET'];
      if(!id||!secret) return {items:[],message:'Configure Google Custom Search or Spotify credentials.'};
      const auth=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{Authorization:`Basic ${btoa(`${id}:${secret}`)}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
      if(!auth.ok) throw new Error('Spotify token unavailable');
      const at=await auth.json() as {access_token?:string};
      if(!at.access_token) throw new Error('Spotify authorization failed');
      const url=new URL('https://api.spotify.com/v1/search');
      url.searchParams.set('q',data.query);url.searchParams.set('type','track');url.searchParams.set('limit','9');
      const r=await fetch(url,{headers:{Authorization:`Bearer ${at.access_token}`}});if(!r.ok) throw new Error('Spotify search is unavailable');
      const b=await r.json() as {tracks?:{items?:Array<{id:string;name:string;artists?:{name:string}[];external_urls?:{spotify:string};album?:{images?:{url:string}[]}}>}};
      return {items:(b.tracks?.items??[]).map(x=>({title:x.name.slice(0,250),creator:(x.artists??[]).map(a=>a.name).join(', ').slice(0,180),provider:'spotify',providerId:x.id,sourceUrl:safeUrl(x.external_urls?.spotify),coverUrl:safeUrl(x.album?.images?.[0]?.url)})),message:'Google Custom Search is not configured; showing Spotify results.'};
    } catch(err) { return {items:[],message:err instanceof Error?err.message:'Online search unavailable.'}; }
  });

export const addInterest = createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator(input=>z.union([
    z.object({workId:z.string().uuid()}).strict(),
    externalSchema
  ]).parse(input))
  .handler(async({data,context})=>{
    if('workId' in data) {
      const {data:work,error}=await context.supabase.from('go_works').select('id,module,canonical_title,status').eq('id',data.workId).eq('status','published').maybeSingle();
      if(error||!work) throw new Error('Work not found in the published catalog');
      const existing=await context.supabase.from('go_user_interests').select('id').eq('user_id',context.userId).eq('work_id',work.id).maybeSingle();
      if(existing.data) return {status:'saved' as const};
      const {error:insertError}=await context.supabase.from('go_user_interests').insert({user_id:context.userId,module:work.module,work_id:work.id,title:work.canonical_title});
      if(insertError && insertError.code!=='23505') throw new Error('Could not save this interest');
      return {status:'saved' as const};
    }
    const {data:submission,error:submitError}=await context.supabase.from('go_catalog_submissions').insert({
      user_id:context.userId,module:data.module,title:data.title,creator:data.creator,provider:data.provider,
      provider_id:data.providerId??null,source_url:data.sourceUrl??null,cover_url:data.coverUrl??null,language:data.language,status:'pending'
    }).select('id').single();
    if(submitError||!submission) throw new Error('Could not submit the new work');
    const {error:interestError}=await context.supabase.from('go_user_interests').insert({
      user_id:context.userId,module:data.module,submission_id:submission.id,title:data.title
    });
    if(interestError) throw new Error('Suggestion submitted but could not be saved to interests');
    return {status:'pending' as const};
  });

export const getModerationQueue=createServerFn({method:'GET'})
  .middleware([requireSupabaseAuth])
  .handler(async({context})=>{
    const {data:isAdmin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(!isAdmin) throw new Error('Admin access required');
    const {data,error}=await context.supabase.from('go_catalog_submissions').select('*').eq('status','pending').order('created_at',{ascending:true}).limit(100);
    if(error) throw new Error('Could not load pending submissions');
    return data??[];
  });

export const reviewSuggestion=createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator(input=>z.object({
    id:z.string().uuid(),decision:z.enum(['approved','rejected']),
    primaryVibe:z.string().refine(v=>VIBES.some(x=>x.id===v)),
    spectrumX:z.number().int().min(0).max(100),
    spectrumY:z.number().int().min(0).max(100),
    scope:z.enum(['global','local'])
  }).strict().parse(input))
  .handler(async({data,context})=>{
    const {data:isAdmin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(!isAdmin) throw new Error('Admin access required');
    const {data:item,error:readError}=await context.supabase.from('go_catalog_submissions').select('*').eq('id',data.id).eq('status','pending').maybeSingle();
    if(readError||!item) throw new Error('Suggestion already processed or missing');
    let workId:string|null=null;
    if(data.decision==='approved') {
      const scope=item.module==='watch'?'global':data.scope;
      const language=scope==='local'?item.language:null;
      if(scope==='local'&&!language) throw new Error('A local work requires a known language');
      const {data:work,error:insertError}=await context.supabase.from('go_works').insert({
        module:item.module,canonical_title:item.title,creator:item.creator,scope,language,
        primary_vibe:data.primaryVibe,spectrum_x:data.spectrumX,spectrum_y:data.spectrumY,
        provider:item.provider,provider_id:item.provider_id,cover_url:item.cover_url,status:'published'
      }).select('id').single();
      if(insertError||!work) throw new Error('Could not publish work; check for duplicate provider ID');
      workId=work.id;
    }
    const {error:updateError}=await context.supabase.from('go_catalog_submissions').update({
      status:data.decision,reviewed_by:context.userId,reviewed_at:new Date().toISOString(),reviewed_work_id:workId
    }).eq('id',data.id).eq('status','pending');
    if(updateError) throw new Error('Work may have published, but moderation status failed. Reconcile in Studio.');
    return {status:data.decision,workId};
  });
