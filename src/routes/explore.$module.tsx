import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight, Check, Loader2, Globe2, Plus, Clapperboard, BookOpen, Music2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { MODULES, isModuleId } from '@/lib/modules';
import { displayTitle, visibleWorks, unbiasedDiscoveryOrder, PAGE_SIZE, SPOKEN_LANGUAGES, type SpokenLanguage } from '@/lib/catalog';
import { addInterest, searchOnlineWorks, type OnlineHit } from '@/lib/catalog.functions';
import { PageHeader } from '@/components/go/shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Database } from '@/integrations/supabase/types';

type Work=Database['public']['Tables']['go_works']['Row'];
export const Route=createFileRoute('/explore/$module')({
  loader:({params})=>{if(!isModuleId(params.module)) throw notFound();return {module:params.module};},
  head:({loaderData})=>({meta:[{title:`${MODULES.find(m=>m.id===loaderData?.module)?.brand??'GO'} — GO`},
    {name:'description',content:'Browse films, books and music and save whatever you genuinely enjoy.'}]}),
  component:ModulePage
});

function ModulePage(){
  const {t}=useI18n();
  const {module}=Route.useLoaderData();
  const navigate=useNavigate();
  const meta=MODULES.find(m=>m.id===module)!;
  const [spoken,setSpoken]=useState<SpokenLanguage>('fa');
  const [discoverySeed,setDiscoverySeed]=useState('go-guest');
    const [query,setQuery]=useState('');
  const [page,setPage]=useState(0);
  const [onlineQuery,setOnlineQuery]=useState('');
  const [online,setOnline]=useState<OnlineHit[]>([]);
  const [onlineNotice,setOnlineNotice]=useState('');
  const [searching,setSearching]=useState(false);
  const [saving,setSaving]=useState<string|null>(null);
  const [saved,setSaved]=useState<string[]>([]);
  const all=useQuery({queryKey:['go-catalog'],queryFn:async()=>{
    const [works,editions]=await Promise.all([
      supabase.from('go_works').select('*').eq('status','published').order('primary_vibe').range(0,1999),
      supabase.from('go_work_editions').select('*').range(0,1999)
    ]);
    if(works.error) throw works.error;
    if(editions.error) throw editions.error;
    return {works:works.data??[],editions:editions.data??[]};
  }});
  useEffect(()=>{
    let mounted=true;
    void supabase.auth.getUser().then(async({data})=>{
      if(!data.user) return;
      if(mounted) setDiscoverySeed(data.user.id);
      const {data:profile}=await supabase.from('profiles').select('spoken_language').eq('id',data.user.id).maybeSingle();
      const matched=SPOKEN_LANGUAGES.find(l=>l.value===profile?.spoken_language);
      if(mounted&&matched) setSpoken(matched.value);
    });
    return ()=>{mounted=false;};
  },[]);
  const works=useMemo(()=>unbiasedDiscoveryOrder(visibleWorks(all.data?.works??[],module,spoken),discoverySeed+'-'+module)
    .filter(w=>!query.trim() || [w.canonical_title,displayTitle(w,all.data?.editions??[],spoken),w.creator]
      .some(s=>s.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))),[all.data,module,spoken,query,discoverySeed]);
  const items=works.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const totalPages=Math.ceil(works.length/PAGE_SIZE);
  function resetFilters(){setPage(0);setOnline([]);setOnlineNotice('');}
  async function remember(work:Work){
    const key=work.id;
    setSaving(key);
    try{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user) {void navigate({to:'/auth',search:{next:`/explore/${module}`}});return;}
      await addInterest({data:{workId:work.id}});
      setSaved(prev=>prev.includes(key)?prev:[...prev,key]);
      toast.success(t({fa:'به علاقه‌مندی‌ها اضافه شد',en:'Added to your interests'}));
    }catch(e){toast.error(e instanceof Error?e.message:'Could not save');}
    finally{setSaving(null);}
  }
  async function runSearch(e:React.FormEvent){
    e.preventDefault();
    if(onlineQuery.trim().length<2) return;
    setSearching(true);setOnlineNotice('');setOnline([]);
    try {
      const {data:{user}}=await supabase.auth.getUser();
      if(!user) {void navigate({to:'/auth',search:{next:`/explore/${module}`}});return;}
      const r=await searchOnlineWorks({data:{module,query:onlineQuery.trim(),language:spoken}});
      setOnline(r.items);setOnlineNotice(r.message);
    }catch(e){setOnlineNotice(e instanceof Error?e.message:'Search failed');}
    finally{setSearching(false);}
  }
  async function addExternal(hit:OnlineHit,index:number){
    const key=`online-${index}`;
    setSaving(key);
    try {
      const r=await addInterest({data:{module,title:hit.title,creator:hit.creator,provider:hit.provider,
        providerId:hit.providerId,sourceUrl:hit.sourceUrl,coverUrl:hit.coverUrl,language:spoken}});
      if(r.status==='pending') {
        setSaved(prev=>[...prev,key]);
        toast.success(t({fa:'به سلیقهٔ تو اضافه شد؛ برای بانک عمومی منتظر تأیید ادمین است.',en:'Saved to your taste; pending admin approval for the shared catalog.'}));
      }
    }catch(e){toast.error(e instanceof Error?e.message:'Could not save');}
    finally{setSaving(null);}
  }
  return <div className="pb-16">
    <PageHeader title={`${meta.brand} · ${t(meta.name)}`} subtitle={t(meta.tagline)}/>
    <div className="mb-6 flex flex-wrap gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">{t({fa:'زبان آثار',en:'Content language'})}
        <select className="h-10 rounded-lg border bg-background px-3 text-sm text-foreground" value={spoken} onChange={e=>{setSpoken(e.target.value as SpokenLanguage);resetFilters();}}>
          {SPOKEN_LANGUAGES.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </label>
      <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-muted-foreground">{t({fa:'جست‌وجو در بانک GO',en:'Search GO catalog'})}
        <div className="relative"><Search className="pointer-events-none absolute end-3 top-3 size-4"/><Input value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} placeholder={t({fa:'نام اثر یا خالق',en:'Title or creator'})} className="pe-10"/></div>
      </label>
    </div>
    <div className="mb-4 text-sm text-muted-foreground" aria-live="polite">
      {all.isLoading?t({fa:'در حال بارگذاری آثار…',en:'Loading works…'}):`${works.length} ${t({fa:'اثر تأییدشده',en:'approved works'})}`}
      {all.error && <span className="ms-2 text-destructive">{t({fa:'اتصال کاتالوگ برقرار نیست. Migration دیتابیس را بررسی کن.',en:'Catalog unavailable. Check the database migration.'})}</span>}
    </div>
    {!all.isLoading&&!all.error&&works.length===0 && <div className="mb-6 rounded-xl border border-dashed p-6 text-muted-foreground">
      {t({fa:'هنوز اثری با این زبان یا عبارت جست‌وجو پیدا نشده است. از جست‌وجوی آنلاین استفاده کن.',en:'No works found for this language or search. Try online search.'})}
    </div>}
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {items.map(w=><button key={w.id} type="button" onClick={()=>void remember(w)}
        className="group relative min-w-0 overflow-hidden rounded-xl border bg-card text-start transition-colors hover:border-primary/70">
        <div className="relative aspect-[3/4] bg-accent/50">
          {w.cover_url ? <img loading="lazy" src={w.cover_url} alt="" className="h-full w-full object-cover"/> :
            <div className="flex h-full items-center justify-center text-muted-foreground">{module==='watch'?<Clapperboard className="size-9"/>:module==='read'?<BookOpen className="size-9"/>:<Music2 className="size-9"/>}</div>}
          <span className="absolute end-2 top-2 rounded-full bg-background/90 p-1.5">
            {saving===w.id?<Loader2 className="size-4 animate-spin"/>:saved.includes(w.id)?<Check className="size-4 text-primary"/>:<Plus className="size-4"/>}
          </span>
        </div>
        <div className="p-2 sm:p-3">
          <div className="line-clamp-2 text-xs font-semibold sm:text-sm">{displayTitle(w,all.data?.editions??[],spoken)}</div>
          {w.creator && <div className="mt-1 truncate text-[11px] text-muted-foreground">{w.creator}</div>}
        </div>
      </button>)}
    </div>
    {totalPages>1&&<nav className="mt-6 flex items-center justify-center gap-4" aria-label="Catalog pages">
      <Button type="button" variant="secondary" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}><ChevronRight className="size-4"/>{t({fa:'قبلی',en:'Previous'})}</Button>
      <span className="text-sm tabular-nums">{page+1} / {totalPages}</span>
      <Button type="button" variant="secondary" disabled={page>=totalPages-1} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))}>{t({fa:'بعدی',en:'Next'})}<ChevronLeft className="size-4"/></Button>
    </nav>}
    <section className="mt-10 rounded-2xl border bg-card p-4 sm:p-6">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold"><Globe2 className="size-5"/>{t({fa:'جست‌وجوی آنلاین',en:'Online search'})}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t({fa:'اثر دلخواهت را پیدا کن. انتخابش فوراً در سلیقهٔ تو ذخیره می‌شود اما برای ورود به بانک اصلی GO باید توسط ادمین تأیید شود.',en:'Find a work and add it to your taste. It joins the public GO catalog only after admin approval.'})}</p>
      <form onSubmit={runSearch} className="flex min-w-0 gap-2">
        <Input value={onlineQuery} onChange={e=>setOnlineQuery(e.target.value)} minLength={2} maxLength={100} placeholder={t({fa:'نام فیلم، آهنگ یا کتاب',en:'Search a film, song or book'})}/>
        <Button type="submit" disabled={searching||onlineQuery.trim().length<2}>{searching?<Loader2 className="size-4 animate-spin"/>:<Search className="size-4"/>}<span className="hidden sm:inline">{t({fa:'جست‌وجو',en:'Search'})}</span></Button>
      </form>
      {!!onlineNotice && <p className="mt-3 text-xs text-muted-foreground">{onlineNotice}</p>}
      {!!online.length && <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        {online.map((hit,i)=><button key={i} type="button" onClick={()=>void addExternal(hit,i)} className="relative min-w-0 overflow-hidden rounded-xl border bg-background text-start hover:border-primary/70">
          <div className="relative aspect-[3/4] bg-accent/50">
            {hit.coverUrl?<img src={hit.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center"><Search className="size-7 text-muted-foreground"/></div>}
            <span className="absolute end-2 top-2 rounded-full bg-card/90 p-1.5">
              {saving===`online-${i}`?<Loader2 className="size-4 animate-spin"/>:saved.includes(`online-${i}`)?<Check className="size-4 text-primary"/>:<Plus className="size-4"/>}
            </span>
          </div>
          <div className="p-2"><div className="line-clamp-2 text-xs font-semibold">{hit.title}</div><div className="mt-1 truncate text-xs text-muted-foreground">{hit.creator}</div></div>
        </button>)}
      </div>}
    </section>
    <div className="mt-8"><Button asChild variant="secondary"><Link to="/discover">{t({fa:'بازگشت به انتخاب‌ها',en:'Back to discovery'})}</Link></Button></div>
  </div>;
}
