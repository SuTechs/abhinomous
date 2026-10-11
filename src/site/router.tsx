// A tiny history-API router: the site only has a handful of routes.
import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

const RouterContext = createContext<{ path: string; navigate: (to: string) => void }>({
  path: '/',
  navigate: () => {},
});

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalize(window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(normalize(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    const next = normalize(new URL(to, window.location.origin).pathname);
    if (next !== normalize(window.location.pathname)) window.history.pushState(null, '', to);
    setPath(next);
    window.scrollTo({ top: 0 });
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(to);
      }}
      {...rest}
    />
  );
}
