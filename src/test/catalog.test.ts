import {describe,expect,it} from 'vitest';
import {catalogQuota,displayTitle,visibleWorks,unbiasedDiscoveryOrder,PAGE_SIZE} from '@/lib/catalog';
import {VIBES} from '@/lib/vibes';
import type {Database} from '@/integrations/supabase/types';

type Work=Database['public']['Tables']['go_works']['Row'];
const make=(changes:Partial<Work>={}):Work=>({
 id:'00000000-0000-4000-8000-000000000001',
 module:'read',canonical_title:'The Little Prince',creator:'Antoine de Saint-Exupéry',
 release_year:1943,original_language:'fr',scope:'global',language:null,
 primary_vibe:'spiritual-wonder',secondary_vibes:['quiet-wisdom'],
 spectrum_x:60,spectrum_y:20,cover_url:null,provider:null,provider_id:null,
 curator_notes:null,status:'published',created_at:'2026-01-01',updated_at:'2026-01-01',
 ...changes
});
describe('starter catalog rules',()=>{
 it('uses exactly nine cards per page',()=>expect(PAGE_SIZE).toBe(9));
 it('has the requested international/local language quotas',()=>{
  expect(catalogQuota('watch')).toEqual({global:144,local:0});
  expect(catalogQuota('listen')).toEqual({global:100,local:44});
  expect(catalogQuota('read')).toEqual({global:72,local:72});
 });
 it('shows the authentic Persian edition of The Little Prince',()=>{
  const work=make();
  const edition={id:'2',work_id:work.id,language:'fa',display_title:'شازده کوچولو',publisher_or_translator:null,source_url:null,cover_url:null};
  expect(displayTitle(work,[edition],'fa')).toBe('شازده کوچولو');
  expect(displayTitle(work,[edition],'en')).toBe('The Little Prince');
 });
 it('never exposes drafts or foreign-language local entries',()=>{
  const local=make({id:'local',scope:'local',language:'fa',canonical_title:'کتاب فارسی'});
  const draft=make({id:'draft',status:'draft'});
  const all=[make(),local,draft];
  expect(visibleWorks(all,'read','en').map(w=>w.id)).toEqual([make().id]);
  expect(visibleWorks(all,'read','fa')).toHaveLength(2);
 });
 it('does not reveal a taxonomy filter in the public work selector',()=>{
  expect(visibleWorks([make()],'read','fa')).toHaveLength(1);
 });
 it('shows four different hidden quadrants among the first four cards, with stable unbiased order',()=>{
  const items=VIBES.flatMap((v,i)=>Array.from({length:6},(_,j)=>make({
    id:`work-${i}-${j}`,canonical_title:`Title ${i} - ${j}`,
    primary_vibe:v.id
  })));
  const ordered=unbiasedDiscoveryOrder(items,'seed-for-same-user');
  expect(ordered).toHaveLength(144);
  expect(new Set(ordered.map(w=>w.id)).size).toBe(144);
  expect(new Set(ordered.slice(0,4).map(w=>VIBES.find(v=>v.id===w.primary_vibe)?.quadrant)).size).toBe(4);
  expect(unbiasedDiscoveryOrder(items,'seed-for-same-user').map(w=>w.id)).toEqual(ordered.map(w=>w.id));
 });
});