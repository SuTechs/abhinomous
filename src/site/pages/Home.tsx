import { useRef, type PointerEvent } from 'react';
import { listBooks, listLearningLog, listMoments, listPosts, listSkills } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { Link } from '../router';
import { useAsync, useSettings, useTitle } from '../hooks';
import { LearningGrid, Polaroid, RoundLink, swatch } from '../components/Bits';
import { ArrowUpRight } from '../components/Icons';
import { Socials } from '../components/Socials';
import { site } from '../../site.config';

export function Home() {
  useTitle(undefined);
  return (
    <>
      <div className="mt-14 grid gap-5 sm:mt-20 lg:mt-28 lg:grid-cols-3">
        <Hero />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
          <RecentPosts />
          <QuoteCard />
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <BlogsTile />
        <UpskillingTile />
        <BooksTile />
      </div>

      <LifeLately />
    </>
  );
}

function Hero() {
  const settings = useSettings();
  const tilt = useRef<HTMLDivElement>(null);
  // Wait for settings so the placeholder doesn't flash before an uploaded avatar.
  const avatar = settings ? settings.avatar_url || '/avatar.svg' : null;

  // A gentle 3D tilt that follows the pointer (mouse only, and only if motion is welcome).
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !tilt.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    tilt.current.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 8}deg) translateX(${x * 14}px)`;
  };
  const onPointerLeave = () => {
    if (tilt.current) tilt.current.style.transform = '';
  };

  return (
    <section
      aria-label="Introduction"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative flex min-h-[560px] flex-col-reverse gap-6 rounded-[36px] bg-cobalt p-6 text-white sm:p-10 md:flex-row lg:col-span-2 lg:p-12"
    >
      <div className="relative z-10 flex flex-col justify-end gap-5 md:flex-[1_1_380px]">
        <p className="m-0 text-[28px] font-semibold tracking-[-0.02em] text-white/90 sm:text-[32px]">Hi! I am</p>
        <h1 className="-mt-3 mb-0 text-[clamp(52px,5.4vw,76px)] leading-[0.95] font-extrabold tracking-[-0.045em]">{site.firstName}.</h1>
        <p className="m-0 max-w-[34ch] text-lg leading-normal text-white/90">{settings?.intro}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link to="/blogs" className="rounded-full bg-white px-6 py-3.5 font-bold text-cobalt transition-transform hover:-translate-y-0.5">
            Read the blog →
          </Link>
          <Socials settings={settings} className="inline-flex size-11 items-center justify-center rounded-full border-[1.5px] border-white/55 text-white transition-colors hover:bg-white/10" />
        </div>
      </div>

      <div aria-hidden="true" className="relative min-h-[320px] sm:min-h-[360px] md:min-h-0 md:flex-[1_1_260px]">
        <div className="absolute top-[46%] left-1/2 size-[330px] -translate-1/2 rounded-full border-[1.5px] border-white/30 md:size-[460px]" />
        <div className="absolute top-[46%] left-1/2 size-[250px] -translate-1/2 rounded-full bg-tangerine md:size-[360px]" />
        <div
          ref={tilt}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out will-change-transform sm:-bottom-10 lg:-bottom-12"
        >
          {avatar && (
            <img
              src={avatar}
              alt=""
              width={400}
              height={760}
              className="h-[400px] w-auto max-w-[min(88vw,560px)] object-contain object-bottom drop-shadow-[0_24px_30px_rgba(0,0,0,0.28)] sm:h-[460px] md:h-[620px] lg:h-[700px]"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function RecentPosts() {
  const { data: posts } = useAsync(() => listPosts(3), []);
  return (
    <article className="flex flex-col gap-1.5 rounded-[32px] bg-white p-7">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">Recent posts</h2>
        <RoundLink to="/blogs" label="All posts" />
      </div>
      {posts?.length === 0 && <p className="m-0 border-t border-line py-4 text-muted">The first post is on its way.</p>}
      {posts?.map((post) => (
        <Link key={post.id} to={`/blogs/${post.slug}`} className="group flex flex-col gap-1.5 border-t border-line py-3">
          <span className="font-mono text-xs text-cobalt">{formatDate(post.published_at)}</span>
          <span className="text-lg font-semibold tracking-[-0.01em] group-hover:underline group-hover:underline-offset-4">{post.title}</span>
        </Link>
      ))}
    </article>
  );
}

function QuoteCard() {
  const settings = useSettings();
  if (!settings?.quote) return null;
  return (
    <article className="flex flex-col gap-2.5 rounded-[32px] bg-tangerine p-7 text-ink">
      <span aria-hidden="true" className="mt-4 text-8xl leading-[0.6] font-extrabold">
        “
      </span>
      <blockquote className="m-0 text-[26px] leading-tight font-semibold tracking-[-0.02em]">{settings.quote}</blockquote>
      {settings.quote_author && <span className="mt-auto font-mono text-[13px]">— {settings.quote_author}</span>}
    </article>
  );
}

function TileHead({ eyebrow, to, label, dark }: { eyebrow: string; to: string; label: string; dark?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className={`font-mono text-[13px] ${dark ? 'text-ash' : 'text-muted'}`}>{eyebrow}</span>
      <RoundLink to={to} label={label} dark={dark} />
    </div>
  );
}

function BlogsTile() {
  const { data: posts } = useAsync(() => listPosts(3), []);
  const fan = ['-rotate-[10deg] left-0 -bottom-2.5', '-rotate-2 left-[24%] bottom-0', 'rotate-[7deg] left-[48%] -bottom-1.5'];
  return (
    <article className="relative flex min-h-[380px] flex-col gap-2 overflow-hidden rounded-[32px] bg-white p-7">
      <TileHead eyebrow="01 / Writing" to="/blogs" label="Open blogs" />
      <h2 className="m-0 text-[52px] leading-none font-extrabold tracking-[-0.04em]">Blogs</h2>
      <p className="m-0 max-w-[26ch] leading-normal text-muted">Long-form thoughts and short notes.</p>
      <div aria-hidden="true" className="relative mt-auto h-[150px]">
        {fan.map((position, i) => {
          const post = posts?.[i];
          return (
            <div
              key={position}
              className={`absolute flex h-[120px] w-[52%] max-w-[190px] flex-col gap-2 overflow-hidden rounded-[18px] p-4 shadow-[0_12px_24px_rgba(22,23,28,0.14)] ${position} ${swatch(i)}`}
            >
              {post?.cover_url ? (
                <img src={post.cover_url} alt="" className="absolute inset-0 size-full object-cover" />
              ) : post ? (
                <span className="line-clamp-3 text-sm leading-snug font-semibold">{post.title}</span>
              ) : (
                <>
                  <span className="h-2 w-[70%] rounded bg-current opacity-70" />
                  <span className="h-2 w-[45%] rounded bg-current opacity-40" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function UpskillingTile() {
  const { data: log } = useAsync(() => listLearningLog(90), []);
  const { data: skills } = useAsync(listSkills, []);
  const learning = skills?.filter((s) => s.status === 'learning').slice(0, 3) ?? [];
  return (
    <article className="flex min-h-[380px] flex-col gap-2 rounded-[32px] bg-ink p-7 text-white">
      <TileHead eyebrow="02 / Learning" to="/upskilling" label="Open upskilling" dark />
      <h2 className="m-0 text-[52px] leading-none font-extrabold tracking-[-0.04em]">Upskilling</h2>
      <p className="m-0 max-w-[30ch] leading-normal text-[#B4B8C3]">A public learning log — one square per day.</p>
      <div className="mt-auto pt-3">
        <LearningGrid entries={log ?? []} days={90} columns={18} />
      </div>
      {learning.length > 0 && (
        <ul className="m-0 mt-2.5 flex list-none flex-wrap gap-2 p-0">
          {learning.map((s) => (
            <li key={s.id} className="rounded-full border border-white/30 px-3.5 py-1.5 text-sm">
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

const SPINES = [
  { w: 26, h: 150, c: 'bg-cobalt' },
  { w: 20, h: 126, c: 'bg-ink' },
  { w: 30, h: 160, c: 'bg-tangerine' },
  { w: 22, h: 136, c: 'bg-[#D5D9E2]' },
  { w: 28, h: 152, c: 'bg-ink' },
  { w: 24, h: 146, c: 'bg-peach' },
  { w: 32, h: 120, c: 'bg-[#8A93A8]' },
  { w: 22, h: 156, c: 'bg-tangerine' },
  { w: 26, h: 134, c: 'bg-cobalt' },
];

function BooksTile() {
  const { data: books } = useAsync(() => listBooks(1), []);
  const latest = books?.[0];
  return (
    <article className="flex min-h-[380px] flex-col gap-2 rounded-[32px] bg-white p-7 md:col-span-2 lg:col-span-1">
      <TileHead eyebrow="03 / Reading" to="/books" label="Open book reviews" />
      <h2 className="m-0 text-[52px] leading-none font-extrabold tracking-[-0.04em]">Book reviews</h2>
      <p className="m-0 max-w-[30ch] leading-normal text-muted">
        {latest ? (
          <>
            Latest:{' '}
            <Link to={`/books/${latest.slug}`} className="font-semibold text-ink underline underline-offset-4">
              {latest.title}
            </Link>
          </>
        ) : (
          'Honest notes on what I read.'
        )}
      </p>
      <div aria-hidden="true" className="mt-auto pt-4">
        <div className="flex items-end gap-[5px] overflow-hidden px-2">
          {SPINES.map((s, i) => (
            <div
              key={i}
              className={`shrink-0 rounded-t-[4px] rounded-b-[2px] ${s.c} ${i === 5 ? 'mr-[26px] origin-bottom-left rotate-12' : ''}`}
              style={{ width: s.w, height: s.h, backgroundImage: 'linear-gradient(transparent 16px, rgba(255,255,255,0.4) 16px 19px, transparent 19px)' }}
            />
          ))}
        </div>
        <div className="h-2.5 rounded-[5px] bg-ink" />
      </div>
    </article>
  );
}

function LifeLately() {
  const { data: moments } = useAsync(() => listMoments(4), []);
  if (!moments?.length) return null;
  return (
    <section aria-labelledby="life-heading" className="mt-5 flex flex-col gap-7 rounded-[36px] bg-mist p-6 sm:p-9">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[13px] text-[#4B5060]">04 / Life</span>
          <h2 id="life-heading" className="m-0 text-[44px] leading-none font-extrabold tracking-[-0.04em]">
            Life, lately
          </h2>
        </div>
        <Link to="/life" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-white transition-transform hover:-translate-y-0.5">
          See all moments <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-7 px-2 pb-2 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {moments.map((m, i) => (
          <Polaroid key={m.id} moment={m} index={i} />
        ))}
      </div>
    </section>
  );
}
