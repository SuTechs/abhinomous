import { useState } from 'react';
import { Link, useRouter } from '../router';
import { useSettings } from '../hooks';
import { CloseIcon, MenuIcon } from './Icons';
import { site } from '../../site.config';

export const SECTIONS = [
  { to: '/blogs', label: 'Blogs' },
  { to: '/upskilling', label: 'Upskilling' },
  { to: '/books', label: 'Book reviews' },
  { to: '/life', label: 'Life' },
];

export function Nav() {
  const { path } = useRouter();
  const settings = useSettings();
  const [open, setOpen] = useState(false);

  const linkClass = (to: string) =>
    `rounded-full px-4 py-3 text-base font-medium transition-colors hover:bg-paper ${path.startsWith(to) ? 'bg-paper' : ''}`;

  return (
    <header className="sticky top-3 z-40 sm:top-4">
      <div className="flex items-center justify-between gap-4 rounded-[40px] bg-white py-2.5 pr-2.5 pl-6 shadow-[0_6px_20px_rgba(22,23,28,0.06)] sm:pl-7">
        <Link to="/" className="text-[26px] font-extrabold tracking-[-0.04em]" onClick={() => setOpen(false)}>
          {site.wordmark}
          <span className="text-cobalt">.</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {SECTIONS.map((s) => (
            <Link key={s.to} to={s.to} className={linkClass(s.to)} aria-current={path.startsWith(s.to) ? 'page' : undefined}>
              {s.label}
            </Link>
          ))}
          {settings?.email && (
            <a href={`mailto:${settings.email}`} className="ml-1.5 rounded-full bg-cobalt px-6 py-3.5 font-semibold text-white transition-transform hover:-translate-y-0.5">
              Say hi
            </a>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex size-12 items-center justify-center rounded-full bg-paper md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Primary" className="mt-2 flex flex-col gap-1 rounded-[28px] bg-white p-3 shadow-[0_12px_30px_rgba(22,23,28,0.12)] md:hidden">
          {SECTIONS.map((s) => (
            <Link key={s.to} to={s.to} className={`${linkClass(s.to)} text-lg`} onClick={() => setOpen(false)}>
              {s.label}
            </Link>
          ))}
          {settings?.email && (
            <a href={`mailto:${settings.email}`} className="mt-1 rounded-full bg-cobalt px-6 py-3.5 text-center font-semibold text-white">
              Say hi
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
