import type { Settings } from '../../lib/types';
import { BookIcon, InstagramIcon, LinkedInIcon, MailIcon, XIcon } from './Icons';

const NETWORKS = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'x', label: 'X', Icon: XIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { key: 'goodreads', label: 'Goodreads', Icon: BookIcon },
] as const;

export function Socials({ settings, className }: { settings: Settings | undefined; className: string }) {
  if (!settings) return null;
  const links = [
    ...NETWORKS.filter((n) => settings[n.key]).map((n) => ({ href: settings[n.key]!, label: n.label, Icon: n.Icon })),
    ...(settings.email ? [{ href: `mailto:${settings.email}`, label: 'Email', Icon: MailIcon }] : []),
  ];
  return (
    <>
      {links.map(({ href, label, Icon }) => (
        <a key={label} href={href} aria-label={label} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={className}>
          <Icon size={label === 'X' ? 18 : 20} />
        </a>
      ))}
    </>
  );
}
