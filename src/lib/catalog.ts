import type { Database } from '@/integrations/supabase/types';
import { VIBES } from './vibes';
import type { ModuleId } from './modules';
export type Work = Database['public']['Tables']['go_works']['Row'];
export type Edition = Database['public']['Tables']['go_work_editions']['Row'];
export const SPOKEN_LANGUAGES = [
 {value:'fa', label:'فارسی / Persian'},
 {value:'en', label:'English'},
 {value:'fr', label:'Français'},
 {value:'es', label:'Español'},
 {value:'de', label:'Deutsch'}
] as const;
export type SpokenLanguage = typeof SPOKEN_LANGUAGES[number]['value'];
export const PAGE_SIZE = 9;
export function displayTitle(work: Work, editions: Edition[], lang: SpokenLanguage): string {
  const e=editions.find(e=>e.work_id===work.id && e.language===lang);
  if(e?.display_title) return e.display_title;
  // Canonical identity is language-independent; localized edition title is display-only.
  if(lang==='fa' && work.module==='read' && work.canonical_title.toLowerCase()==='the little prince') return 'شازده کوچولو';
  return work.canonical_title;
}
export function visibleWorks(all: Work[], module: ModuleId, lang: SpokenLanguage, vibe?: string): Work[] {
  const order=new Map(VIBES.map((v,i)=>[v.id,i]));
  return all.filter(w=>w.module===module && w.status==='published' &&
    (w.scope==='global' || w.language===lang) &&
    (!vibe || w.primary_vibe===vibe || w.secondary_vibes.includes(vibe)))
    .sort((a,b)=>(order.get(a.primary_vibe)??999)-(order.get(b.primary_vibe)??999) ||
      a.canonical_title.localeCompare(b.canonical_title));
}
export function catalogQuota(module: ModuleId) {
  if(module==='watch') return {global:144,local:0};
  if(module==='listen') return {global:100,local:44};
  return {global:72,local:72};
}
export function catalogCompleteness(works: Work[], module: ModuleId, lang: SpokenLanguage) {
  const filtered=visibleWorks(works,module,lang);
  return {total:filtered.length, global:filtered.filter(w=>w.scope==='global').length,
    local:filtered.filter(w=>w.scope==='local').length, target:catalogQuota(module)};
}
