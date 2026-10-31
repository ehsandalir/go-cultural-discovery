import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, History, ListMusic, Clapperboard, Headphones, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/go/shell';
import { Button } from '@/components/ui/button';

export const Route=createFileRoute('/_authenticated/library')({
  head:()=>({meta:[{title:'My Library — GO'},{name:'description',content:'Your chosen cultural works and suggestions awaiting moderation.'}]}),
  component:LibraryPage
});
function LibraryPage(){
 const {t}=useI18n();
 const interests=useQuery({queryKey:['go-my-interests'],queryFn:async()=>{
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) throw new Error('Sign in required');
  const [items,submissions]=await Promise.all([
   supabase.from('go_user_interests').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
   supabase.from('go_catalog_submissions').select('id,status').eq('user_id',user.id)
  ]);
  if(items.error) throw items.error;
  if(submissions.error) throw submissions.error;
  return {rows:items.data??[],statuses:new Map((submissions.data??[]).map(x=>[x.id,x.status]))};
 }});
 const modules=[
  {key:'watch',title:{fa:'فیلم‌ها',en:'Films'},icon:Clapperboard},
  {key:'read',title:{fa:'کتاب‌ها',en:'Books'},icon:BookOpen},
  {key:'listen',title:{fa:'موسیقی',en:'Music'},icon:Headphones}
 ];
 return <div className="pb-16">
  <PageHeader title={t({fa:'کتابخانهٔ من',en:'My Library'})} subtitle={t({fa:'آثار انتخابی تو، حتی اگر هنوز در صف تأیید GO باشند.',en:'Works you selected, including those awaiting GO editorial approval.'})}/>
  {interests.isLoading&&<div className="py-10 text-muted-foreground">…</div>}
  {interests.error&&<div className="py-10 text-destructive">{t({fa:'کتابخانه بارگذاری نشد.',en:'Could not load your library.'})}</div>}
  <div className="grid gap-5 lg:grid-cols-3">
   {modules.map(m=>{
    const rows=interests.data?.rows.filter(x=>x.module===m.key)??[];
    return <section key={m.key} className="rounded-2xl border bg-card p-4">
     <div className="mb-4 flex items-center gap-2"><m.icon className="size-5 text-primary"/><h2 className="text-lg font-semibold">{t(m.title)}</h2><span className="ms-auto text-sm text-muted-foreground">{rows.length}</span></div>
     {!rows.length&&<p className="py-6 text-sm text-muted-foreground">{t({fa:'هنوز اثری انتخاب نشده.',en:'No works selected yet.'})}</p>}
     <ul className="space-y-2">{rows.map(row=>{
      const status=row.submission_id?interests.data?.statuses.get(row.submission_id):null;
      return <li key={row.id} className="flex items-start gap-3 rounded-xl border bg-background p-3">
       <Bookmark className="mt-0.5 size-4 shrink-0 text-primary"/>
       <div className="min-w-0 flex-1"><div className="text-sm font-medium">{row.title}</div>
        {!!status&&<div className="mt-1 text-xs text-muted-foreground">{status==='pending'?t({fa:'منتظر تأیید ادمین',en:'Pending admin approval'}):status==='approved'?t({fa:'تأییدشده',en:'Approved'}):t({fa:'برای بانک عمومی رد شد؛ در سلیقهٔ تو باقی می‌ماند.',en:'Not admitted to the public catalog; remains in your taste.'})}</div>}
       </div>
      </li>;
     })}</ul>
    </section>;
   })}
  </div>
  <div className="mt-6 flex flex-wrap gap-3">
   {modules.map(m=><Button key={m.key} asChild variant="secondary"><Link to="/explore/$module" params={{module:m.key as 'watch'|'read'|'listen'}}>{t(m.title)}</Link></Button>)}
  </div>
  <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><History className="size-4"/><ListMusic className="size-4"/>{t({fa:'ثبت وضعیت دیده/خوانده/شنیده و مجموعه‌های اختصاصی در نسخه‌های بعدی اضافه می‌شود.',en:'Watched/read/heard tracking and collections will be added in a later release.'})}</p>
 </div>;
}
