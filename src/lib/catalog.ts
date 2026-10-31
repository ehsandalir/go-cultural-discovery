import type { Database } from '@/integrations/supabase/types';
import { VIBES, type QuadrantId } from './vibes';
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
  if(lang==='fa' && work.module==='read' && work.canonical_title.toLowerCase()==='the little prince') return 'شازده کوچولو';
  return work.canonical_title;
}

/** Only published, language-appropriate titles are eligible for the unbiased first encounter. */
export function visibleWorks(all: Work[], module: ModuleId, lang: SpokenLanguage): Work[] {
  return all.filter(w=>w.module===module && w.status==='published' &&
    (w.scope==='global' || w.language===lang));
}

// Stable pseudo-random selection: user preferences must never be pre-filled from vibe labels.
// Each block of four cards samples four distinct spectrum quadrants behind the scenes.
// The underlying labels, quadrants and scores are *never* shown on onboarding/discovery cards.
function hash(s: string): number {
  let value=2166136261;
  for(let i=0;i<s.length;i++) {
    value^=s.charCodeAt(i);
    value=Math.imul(value,16777619);
  }
  return value>>>0;
}
export function unbiasedDiscoveryOrder(works: Work[], seed='go-guest'): Work[] {
  const quadrants: QuadrantId[]=['dark-deep','bright-light','dark-light','bright-deep'];
  const groups=new Map<string,Work[]>();
  for(const w of works){
    const items=groups.get(w.primary_vibe)??[];
    items.push(w);
    groups.set(w.primary_vibe,items);
  }
  for(const [id,items] of groups) {
    items.sort((a,b)=>hash(seed+a.id+id)-hash(seed+b.id+id) || a.id.localeCompare(b.id));
  }
  const quadrantVibes=quadrants.map(q=>VIBES.filter(v=>v.quadrant===q && groups.has(v.id))
    .sort((a,b)=>hash(seed+a.id)-hash(seed+b.id)));
  const result:Work[]=[];
  let depth=0;
  const used=new Set<string>();
  const start=hash(seed+'quadrants')%quadrants.length;
  while(result.length<works.length && depth<1000){
    let madeProgress=false;
    for(let q=0;q<quadrants.length;q++){
      const vibeList=quadrantVibes[(q+start+depth)%quadrants.length]??[];
      if(!vibeList.length) continue;
      // Walk different hidden vibes each cycle; never put all dark/deep works first.
      const vibe=vibeList[depth%vibeList.length];
      const items=groups.get(vibe.id)??[];
      const next=items.find(w=>!used.has(w.id));
      if(next){used.add(next.id);result.push(next);madeProgress=true;}
    }
    depth++;
    if(!madeProgress) break;
  }
  // Handles uneven inventories and legacy works whose vibe is not in the canonical table.
  for(const w of [...works].sort((a,b)=>hash(seed+a.id)-hash(seed+b.id)||a.id.localeCompare(b.id))){
    if(!used.has(w.id)) result.push(w);
  }
  return result;
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
