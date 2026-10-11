import { Link } from '../router';
import { useTitle } from '../hooks';

export function NotFound() {
  useTitle('Not found');
  return (
    <div className="flex flex-col items-start gap-5 px-1 py-20">
      <span className="font-mono text-[13px] text-muted">404</span>
      <h1 className="m-0 text-[clamp(48px,8vw,104px)] leading-[0.95] font-extrabold tracking-[-0.05em]">Nothing here.</h1>
      <p className="m-0 text-lg text-muted">This page may have moved, or it never existed.</p>
      <Link to="/" className="rounded-full bg-ink px-6 py-3.5 font-semibold text-white">
        Back home
      </Link>
    </div>
  );
}
