import { createFileRoute, Link } from '@tanstack/react-router';
import { Clapperboard, BookOpen, Headphones, ArrowLeft } from 'lucide-react';
import { MODULES } from '@/lib/modules';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/go/shell';

export const Route=createFileRoute('/discover')({
  head:()=>({meta:[
    {title:'Discover your favourites — GO'},
    {name:'description',content:'Pick the films, books and songs you genuinely like.'}
  ]}),
  component:Discover
});

function Discover(){
  const {t}=useI18n();
  return (
    <>
      <PageHeader
        title={t({fa:'چه چیزهایی را دوست داری؟',en:'What do you love?'})}
        subtitle={t({
          fa:'از فیلم‌ها، کتاب‌ها و آهنگ‌هایی که می‌شناسی انتخاب کن. اینجا انتخاب درست یا غلط نداریم.',
          en:'Choose from the films, books and songs you know. There are no right or wrong answers.'
        })}
      />
      <section className="pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map(m=>(
            <Link key={m.id} to="/explore/$module" params={{module:m.id}}
              className="group rounded-2xl border bg-card p-6 transition-colors hover:border-primary/60">
              <m.icon className="size-7 text-primary"/>
              <div className="mt-5 text-xs text-muted-foreground" dir="ltr">{m.brand}</div>
              <div className="mt-1 text-xl font-semibold">{t(m.name)}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t(m.tagline)}</p>
              <p className="mt-4 flex items-center gap-2 text-sm text-primary">
                {t({fa:'مشاهده و انتخاب آثار',en:'Browse and choose'})}
                <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180"/>
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-7 text-sm text-muted-foreground">
          {t({fa:'در هر بخش ۹ اثر در ابتدا نمایش داده می‌شود. می‌توانی ورق بزنی یا چیزی را که دوست داری جست‌وجو کنی.',en:'Each section starts with nine works. Turn the pages or search for something you love.'})}
        </p>
      </section>
    </>
  );
}
