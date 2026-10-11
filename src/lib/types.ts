export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  content: string;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  rating: number | null;
  content: string;
  finished_on: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Moment = {
  id: string;
  photo_url: string;
  caption: string | null;
  happened_on: string | null;
  published: boolean;
  created_at: string;
};

export type SkillKind = 'skill' | 'course' | 'certificate';
export type SkillStatus = 'learning' | 'done';

export type Skill = {
  id: string;
  name: string;
  kind: SkillKind;
  status: SkillStatus;
  link: string | null;
  note: string | null;
  created_at: string;
};

export type LogEntry = {
  id: string;
  logged_on: string;
  minutes: number;
  note: string | null;
};

export type Settings = {
  intro: string | null;
  quote: string | null;
  quote_author: string | null;
  email: string | null;
  instagram: string | null;
  x: string | null;
  linkedin: string | null;
  goodreads: string | null;
  /** Hero image; null means the built-in placeholder. */
  avatar_url: string | null;
};
