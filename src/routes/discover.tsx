import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Dna, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { QUADRANTS, VIBES, getVibe, DNA_DIMENSIONS } from '@/lib/vibes';
import { MODULES } from '@/lib/modules';
import { VibeChip, VibeTag, SpectrumMap } from '@/components/go/vibe';
import { PageHeader, PhaseBadge } from '@/components/go/shell';
import { displayTitle, visibleWorks, SPOKEN_LANGUAGES, type SpokenLanguage } from '@/lib/catalog';

type Search = { vibe?: string };
export const Route = createFileRoute('/discover')({
  validateSearch: (s: Record<string,unknown>):Search =>
    typeof s['vibe']==='string' && getVibe(s['vibe']) ? {vibe:s['vibe']} : {},
  head:()=>({meta:[
    {title:'Discover by Vibe — GO'},
    {name:'description',content:'Find real films, books and music by their emotional spectrum.'}
  ]}),
  component:Discover
});
function Discover(){
  const {t}=useI18n();
  const {vibe}=Route.useSearch();
  const navigate=useNavigate({from:'/discover'});
  const select=(id:string)=>navigate({search:id===vibe?{}:{vibe:id},replace:true,resetScroll:false});
  const selected=vibe?getVibe(vibe):undefined;
  const catalog=useQuery({queryKey:['discover-catalog'],queryFn:async()=>{
    const [w,e,user]=await Promise.all([
      supabase.from('go_works').select('*').eq('status','published').range(0,1999),
      supabase.from('go_work_editions').select('*').range(0,1999),
      supabase.auth.getUser()
    ]);
    if(w.error)throw w.error;
    if(e.error)throw e.error;
    let spoken:SpokenLanguage='fa';
    if(user.data.user){
      const {data:profile}=await supabase.from('profiles').select('spoken_language').eq('id',user.data.user.id).maybeSingle();
      spoken=SPOKEN_LANGUAGES.find(l=>l.value===profile?.spoken_language)?.value??'fa';
    }
    return {works:w.data??[],editions:e.data??[],spoken};
  }});
  const matches=selected&&catalog.data?MODULES.flatMap(m=>visibleWorks(catalog.data!.works,m.id,catalog.data!.spoken,selected.id)
    .slice(0,4)):[];
  return <>
    <PageHeader title={t({fa:'کشف',en:'Discover'})} subtitle={t({fa:'از حس شروع کن، نه از ژانر.',en:'Start from a feeling, not a genre.'})}/>
    <section className="pb-12">
      <h2 className="mb-6 text-2xl font-semibold">{t({fa:'وایبت را انتخاب کن',en:'Choose your vibe'})}</h2>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">{QUADRANTS.map(q=><div key={q.id}>
          <h3 className={`mb-3 text-sm font-semibold ${q.colorClass}`}>{t(q.name)}</h3>
          <div className="flex flex-wrap gap-2">{VIBES.filter(v=>v.quadrant===q.id).map(v=>
            <VibeChip key={v.id} vibe={v} active={v.id===vibe} onClick={()=>select(v.id)}/>)}</div>
        </div>)}</div>
        <SpectrumMap {...(vibe?{selected:vibe}:{})} onSelect={select}/>
      </div>
      <div className="mt-8 rounded-2xl border bg-card p-6" aria-live="polite">
        {!selected ? <p className="text-muted-foreground">{t({fa:'یک وایب انتخاب کن تا آثار مرتبط را ببینی.',en:'Pick a vibe to see matching works.'})}</p> :
         <>
          <h3 className="text-xl font-semibold">{t(selected.name)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t({fa:'آثار تأییدشدهٔ GO با این وایب. انتخاب هر اثر وارد ماژول مربوط می‌شود.',en:'Approved GO works for this vibe. Select one to enter its module.'})}</p>
          {catalog.isLoading&&<p className="mt-4 text-muted-foreground">…</p>}
          {catalog.error&&<p className="mt-4 text-destructive">{t({fa:'اتصال به بانک آثار برقرار نیست.',en:'Unable to load the catalog.'})}</p>}
          {!catalog.isLoading&&!catalog.error&&matches.length===0&&<p className="mt-4 text-sm text-muted-foreground">{t({fa:'فعلاً اثری برای این وایب و زبان ثبت نشده است.',en:'No works found for this vibe and language.'})}</p>}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{matches.map(w=>{
            const moduleId=w.module==='listen'?'listen':w.module==='read'?'read':'watch';
            const m=MODULES.find(x=>x.id===moduleId)!;
            return <li key={w.id}><Link to="/explore/$module" params={{module:moduleId}} className="block h-full rounded-xl border bg-background p-4 hover:border-primary/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><m.icon className="size-4"/>{t(m.name)}</div>
              <div className="mt-1 font-semibold">{displayTitle(w,catalog.data?.editions??[],catalog.data?.spoken??'fa')}</div>
              <div className="mt-2 flex flex-wrap gap-1"><VibeTag id={w.primary_vibe} primary/>{w.secondary_vibes.map(s=><VibeTag key={s} id={s}/>)}</div>
            </Link></li>;
          })}</ul>
         </>}
      </div>
    </section>
    <section className="pb-16"><div className="rounded-2xl border border-dashed bg-card/50 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3"><Dna className="size-6 text-primary"/><h2 className="text-2xl font-semibold">{t({fa:'شخصی‌سازی‌شده برای DNA تو',en:'Personalized for Your DNA'})}</h2><PhaseBadge phase={3}/></div>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t({fa:'GO DNA سلیقهٔ فرهنگی تو را در شش بعد غیربالینی توصیف خواهد کرد. تحلیل شخصیت هنوز فعال نیست.',en:'GO DNA will describe your cultural taste along six nonclinical dimensions. Personality analysis is not yet active.'})}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{DNA_DIMENSIONS.map(d=><li key={d.id} className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm">{t(d.name)}<Lock className="size-3.5 text-muted-foreground"/></li>)}</ul>
    </div></section>
  </>;
}
