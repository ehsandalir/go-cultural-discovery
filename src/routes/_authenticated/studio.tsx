import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { getStudioOverview } from '@/lib/access.functions';
import { getModerationQueue, reviewSuggestion } from '@/lib/catalog.functions';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/go/shell';
import { VIBES } from '@/lib/vibes';
import { Button } from '@/components/ui/button';

export const Route=createFileRoute('/_authenticated/studio')({
  head:()=>({meta:[{title:'GO Studio — Moderation'},{name:'robots',content:'noindex'}]}),
  component:Studio
});
function Studio(){
 const {t,lang}=useI18n();
 const qc=useQueryClient();
 const overview=useQuery({queryKey:['studio'],queryFn:()=>getStudioOverview()});
 const queue=useQuery({queryKey:['go-moderation-queue'],queryFn:()=>getModerationQueue(),enabled:overview.data?.allowed===true});
 if(overview.isLoading) return <div className="py-20 text-center text-muted-foreground">…</div>;
 if(!overview.data?.allowed) return <div className="py-20 text-center"><h1 className="text-2xl font-semibold">{t({fa:'دسترسی ندارید',en:'Access denied'})}</h1><Link to="/" className="mt-6 inline-block text-primary underline">{t({fa:'بازگشت',en:'Back home'})}</Link></div>;
 return <div className="pb-16">
  <PageHeader title="GO Studio" subtitle={t({fa:'صف تأیید آثار پیشنهادی و اختصاص وایب و امتیاز طیف',en:'Review suggested works, assign a vibe and spectrum scores'})}/>
  <div className="mb-6 grid gap-3 sm:grid-cols-3">
   <Stat label={t({fa:'وایب‌های ثابت',en:'Canonical vibes'})} value={String(VIBES.length)}/>
   <Stat label={t({fa:'پیشنهادهای منتظر بررسی',en:'Pending suggestions'})} value={String(queue.data?.length??'—')}/>
   <Stat label={t({fa:'طرح‌های اشتراک',en:'Plan definitions'})} value={String(overview.data.plans.length)}/>
  </div>
  <p className="mb-4 text-sm text-muted-foreground">{t({fa:'تنها تو با نقش admin می‌توانی پیشنهادی را وارد کتابخانهٔ عمومی کنی. امتیازهای X (تاریک تا روشن) و Y (عمیق تا سبک) باید پیش از تأیید تعیین شوند.',en:'Only admins may publish suggestions. Set X (dark to bright) and Y (deep to light) before approving.'})}</p>
  {queue.isLoading && <p>…</p>}
  {queue.error && <p className="text-destructive">{t({fa:'خطا در دریافت صف',en:'Could not load queue'})}</p>}
  {queue.data?.length===0 && <p className="rounded-xl border border-dashed p-6 text-muted-foreground">{t({fa:'در حال حاضر پیشنهادی منتظر تأیید نیست.',en:'No pending suggestions.'})}</p>}
  <div className="space-y-4">{queue.data?.map(item=><ReviewCard key={item.id} item={item} lang={lang} onDone={()=>{void qc.invalidateQueries({queryKey:['go-moderation-queue']});void qc.invalidateQueries({queryKey:['go-catalog']});}}/>)}</div>
 </div>;
}
type Suggestion=Awaited<ReturnType<typeof getModerationQueue>>[number];
function ReviewCard({item,lang,onDone}:{item:Suggestion;lang:'fa'|'en';onDone:()=>void}){
 const [vibe,setVibe]=useState(VIBES[0].id);
 const [x,setX]=useState(10);
 const [y,setY]=useState(10);
 const [scope,setScope]=useState<'global'|'local'>(item.module==='watch'?'global':'local');
 const [busy,setBusy]=useState(false);
 async function decision(approved:boolean){
  setBusy(true);
  try {
   await reviewSuggestion({data:{id:item.id,decision:approved?'approved':'rejected',primaryVibe:vibe,spectrumX:x,spectrumY:y,scope}});
   toast.success(lang==='fa'?'بررسی ثبت شد':'Review saved');onDone();
  }catch(e){toast.error(e instanceof Error?e.message:'Could not review');}
  finally{setBusy(false);}
 }
 return <article className="rounded-2xl border bg-card p-4 sm:p-6">
  <div className="flex flex-wrap items-start justify-between gap-2">
   <div><p className="text-xs text-muted-foreground">{item.module} · {item.provider} · {item.language??'global'}</p><h2 className="text-lg font-semibold">{item.title}</h2>{item.creator&&<p className="text-sm text-muted-foreground">{item.creator}</p>}</div>
   {item.source_url?.startsWith('https://')&&<a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">{lang==='fa'?'منبع':'Source'}</a>}
  </div>
  <div className="mt-4 grid gap-3 sm:grid-cols-2">
   <label className="text-sm">{lang==='fa'?'وایب اصلی':'Primary vibe'}
    <select value={vibe} onChange={e=>{const v=VIBES.find(z=>z.id===e.target.value)!;setVibe(v.id);setX(v.x);setY(v.y);}} className="mt-1 h-10 w-full rounded-lg border bg-background px-3">
     {VIBES.map(v=><option value={v.id} key={v.id}>{v.name[lang]}</option>)}
    </select>
   </label>
   <label className="text-sm">{lang==='fa'?'دسته محتوایی':'Content scope'}
    <select value={scope} disabled={item.module==='watch'} onChange={e=>setScope(e.target.value as 'global'|'local')} className="mt-1 h-10 w-full rounded-lg border bg-background px-3">
     <option value="global">{lang==='fa'?'جهانی':'Global'}</option>
     <option value="local">{lang==='fa'?'زبان کاربر':'Local language'}</option>
    </select>
   </label>
   <label className="text-sm">X — {lang==='fa'?'تاریک ← روشن':'Dark → Bright'} <strong className="ms-2">{x}</strong>
    <input aria-label="Spectrum X" type="range" min="0" max="100" value={x} onChange={e=>setX(Number(e.target.value))} className="mt-2 w-full"/>
   </label>
   <label className="text-sm">Y — {lang==='fa'?'عمیق ← سبک':'Deep → Light'} <strong className="ms-2">{y}</strong>
    <input aria-label="Spectrum Y" type="range" min="0" max="100" value={y} onChange={e=>setY(Number(e.target.value))} className="mt-2 w-full"/>
   </label>
  </div>
  <div className="mt-5 flex flex-wrap gap-2">
   <Button disabled={busy} onClick={()=>void decision(true)}>{lang==='fa'?'تأیید و انتشار':'Approve & publish'}</Button>
   <Button disabled={busy} variant="outline" onClick={()=>void decision(false)}>{lang==='fa'?'رد پیشنهاد':'Reject'}</Button>
  </div>
 </article>;
}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-xl border bg-card p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-bold">{value}</div></div>;}
