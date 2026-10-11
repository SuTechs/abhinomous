import DOMPurify from 'dompurify';
import type { ReactNode } from 'react';
import type { Book, LogEntry, Moment, Post } from '../../lib/types';
import { formatDate, isoDay, daysAgo } from '../../lib/format';
import { isLocal } from '../../lib/supabase';
import { Link } from '../router';
import { ArrowUpRight, ImageIcon, StarIcon } from './Icons';

/** Brand colours used when a post or book has no image. */
const SWATCHES = ['bg-cobalt text-white', 'bg-tangerine text-ink', 'bg-ink text-white', 'bg-peach text-ink'];
export const swatch = (index: number) => SWATCHES[index % SWATCHES.length];

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="flex flex-col gap-3 px-1 pt-12 pb-8 sm:pt-16 sm:pb-10">
      <span className="font-mono text-[13px] text-muted">{eyebrow}</span>
      <h1 className="m-0 text-[clamp(48px,8vw,104px)] leading-[0.95] font-extrabold tracking-[-0.05em]">{title}</h1>
      {intro && <p className="m-0 max-w-[48ch] text-lg leading-relaxed text-muted">{intro}</p>}
    </div>
  );
}

export function RoundLink({ to, label, dark }: { to: string; label: string; dark?: boolean }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5 ${dark ? 'bg-white text-ink' : 'bg-ink text-white'}`}
    >
      <ArrowUpRight size={18} />
    </Link>
  );
}

export function RichText({ html }: { html: string }) {
  return <div className="prose-ab" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-48 items-center justify-center font-mono text-sm text-muted">
      {label}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="rounded-[28px] bg-white p-8 text-center text-muted">{children}</div>;
}

/** Only in `npm run dev`: a reminder that this is dummy data, not the live site. */
export function LocalBanner() {
  if (!isLocal) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <p className="m-0 rounded-full bg-ink px-4 py-2 text-center font-mono text-xs text-white shadow-lg">
        Local test mode · dummy data · <a href="/goku/" className="pointer-events-auto underline underline-offset-2">admin</a>
      </p>
    </div>
  );
}

export function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <Link to={`/blogs/${post.slug}`} className="group flex flex-col gap-4 rounded-[32px] bg-white p-4 pb-6 transition-transform hover:-translate-y-1">
      <div className={`relative aspect-[16/10] overflow-hidden rounded-[22px] ${swatch(index)}`}>
        {post.cover_url ? (
          <img src={post.cover_url} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <span aria-hidden="true" className="absolute right-5 bottom-3 text-[96px] leading-none font-extrabold tracking-[-0.06em] opacity-90">
            {post.title.trim().charAt(0).toLowerCase()}.
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 px-2">
        <span className="font-mono text-xs text-cobalt">{formatDate(post.published_at)}</span>
        <h3 className="m-0 text-[22px] leading-tight font-bold tracking-[-0.02em]">{post.title}</h3>
        {post.excerpt && <p className="m-0 line-clamp-2 leading-relaxed text-muted">{post.excerpt}</p>}
      </div>
    </Link>
  );
}

export function Stars({ rating, size = 16 }: { rating: number | null; size?: number }) {
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-tangerine" role="img" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} size={size} filled={n <= rating} />
      ))}
    </span>
  );
}

export function BookCover({ book, index, className = '' }: { book: Book; index: number; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden rounded-r-xl rounded-l-[4px] shadow-[0_18px_30px_rgba(22,23,28,0.18)] ${swatch(index)} ${className}`}>
      {book.cover_url ? (
        <img src={book.cover_url} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="flex size-full flex-col justify-between p-4 pl-6">
          <span className="text-lg leading-tight font-extrabold tracking-[-0.02em]">{book.title}</span>
          {book.author && <span className="font-mono text-xs opacity-80">{book.author}</span>}
        </div>
      )}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2.5 bg-black/15" />
    </div>
  );
}

export function BookCard({ book, index }: { book: Book; index: number }) {
  return (
    <Link to={`/books/${book.slug}`} className="group flex flex-col gap-4">
      <BookCover book={book} index={index} className="transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-1" />
      <div className="flex flex-col gap-1.5 px-1">
        <Stars rating={book.rating} />
        <h3 className="m-0 text-lg leading-tight font-bold tracking-[-0.01em]">{book.title}</h3>
        {book.author && <span className="text-sm text-muted">{book.author}</span>}
      </div>
    </Link>
  );
}

const TILTS = ['-rotate-3', 'rotate-2', '-rotate-[1.5deg]', 'rotate-3'];

export function Polaroid({ moment, index, tilt = true }: { moment: Moment; index: number; tilt?: boolean }) {
  const when = formatDate(moment.happened_on, { month: 'short', year: 'numeric' });
  return (
    <figure className={`m-0 rounded-md bg-white p-3 pb-4 shadow-[0_18px_30px_rgba(22,23,28,0.12),0_2px_6px_rgba(22,23,28,0.08)] transition-transform duration-300 hover:rotate-0 ${tilt ? TILTS[index % TILTS.length] : ''}`}>
      <div className="flex aspect-[4/3] items-center justify-center gap-2 overflow-hidden rounded-[3px] bg-fog font-mono text-[13px] text-[#4B5060]">
        {moment.photo_url ? (
          <img src={moment.photo_url} alt={moment.caption ?? ''} loading="lazy" className="size-full object-cover" />
        ) : (
          <>
            <ImageIcon />
            <span>Photo</span>
          </>
        )}
      </div>
      <figcaption className="pt-3 font-mono text-[13px] text-[#3D414C]">
        {[moment.caption, when].filter(Boolean).join(' · ')}
      </figcaption>
    </figure>
  );
}

/** One square per day, oldest first, lit by minutes spent learning. */
export function LearningGrid({ entries, days, columns }: { entries: LogEntry[]; days: number; columns: number }) {
  const minutes = new Map(entries.map((e) => [e.logged_on, e.minutes]));
  const cells = Array.from({ length: days }, (_, i) => {
    const day = isoDay(daysAgo(days - 1 - i));
    const m = minutes.get(day) ?? 0;
    const opacity = m === 0 ? 0 : m < 30 ? 0.45 : m < 60 ? 0.65 : m < 120 ? 0.85 : 1;
    return { day, m, opacity };
  });
  return (
    <div className="grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} role="img" aria-label={`Learning log: ${entries.length} days of learning in the last ${days} days`}>
      {cells.map((c) => (
        <span key={c.day} title={c.m ? `${formatDate(c.day)} · ${c.m} min` : formatDate(c.day)} className="aspect-square rounded-[3px] bg-coal">
          {c.opacity > 0 && <span className="block size-full rounded-[3px] bg-cobalt" style={{ opacity: c.opacity }} />}
        </span>
      ))}
    </div>
  );
}
