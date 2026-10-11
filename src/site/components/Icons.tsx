import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" />
  </Svg>
);

export const XIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4l16 16" />
    <path d="M20 4L4 20" />
  </Svg>
);

export const LinkedInIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7" />
    <path d="M8 7v.01" />
    <path d="M12 17v-7" />
    <path d="M12 13a3 3 0 0 1 6 0v4" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
);

export const BookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h13v16H6.5A1.5 1.5 0 0 1 5 18.5z" />
    <path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H18" />
  </Svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </Svg>
);

export const ArrowLeft = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Svg>
);

export const ImageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-9 9" />
  </Svg>
);

export const StarIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg fill={filled ? 'currentColor' : 'none'} {...p}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
  </Svg>
);
