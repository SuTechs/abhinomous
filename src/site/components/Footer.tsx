import { useSettings } from '../hooks';
import { Link } from '../router';
import { SECTIONS } from './Nav';
import { Socials } from './Socials';
import { site } from '../../site.config';

export function Footer() {
  const settings = useSettings();
  return (
    <footer className="mt-5 flex flex-col gap-8 overflow-hidden rounded-[36px] bg-ink px-6 pt-8 text-white sm:px-10 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <p className="m-0 max-w-[26ch] text-2xl font-semibold tracking-[-0.02em] sm:text-[28px]">Let’s talk books, life, and everything in between.</p>
        <div className="flex flex-wrap items-center gap-2">
          {settings?.email && (
            <a href={`mailto:${settings.email}`} className="rounded-full bg-tangerine px-6 py-3.5 font-bold text-ink transition-transform hover:-translate-y-0.5">
              Say hi →
            </a>
          )}
          <Socials settings={settings} className="inline-flex size-12 items-center justify-center rounded-full border-[1.5px] border-white/30 transition-colors hover:bg-white/10" />
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 font-mono text-[13px] text-ash">
        <span>
          © {new Date().getFullYear()} {site.fullName}
        </span>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-1">
          {SECTIONS.map((s) => (
            <Link key={s.to} to={s.to} className="py-1 hover:text-white">
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
      <span aria-hidden="true" className="-mb-[0.1em] block text-[clamp(52px,14.5vw,210px)] leading-[0.78] font-extrabold tracking-[-0.06em] whitespace-nowrap">
        {site.wordmark}
        <span className="text-cobalt">.</span>
      </span>
    </footer>
  );
}
