// Dummy content for `npm run dev` only. Never used by `npm run prod` or the production build.
import { daysAgo, isoDay } from '../format';

/** Bump to replace everyone's local test data with a fresh seed. */
export const SEED_VERSION = 2;

const photo = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/abhinomous-${seed}/${w}/${h}`;
const stamp = (days: number) => daysAgo(days).toISOString();
const day = (days: number) => isoDay(daysAgo(days));

const essay = `
<p>Some ideas only show up once you’ve written the first bad paragraph. This is dummy text for local testing, but it’s shaped like a real post so you can judge the reading experience: line length, spacing, headings and the rest.</p>
<h2>Start smaller than feels useful</h2>
<p>The trick that worked was making the habit almost embarrassingly small — one page, ten minutes, no editing. On good days it grew on its own; on bad days the bar was low enough to clear anyway.</p>
<blockquote>Consistency beats intensity, especially when nobody is watching.</blockquote>
<h3>What changed</h3>
<ul><li>Fewer half-finished drafts</li><li>Clearer thinking before big decisions</li><li>A record of what each month actually felt like</li></ul>
<p>None of it is dramatic. That is sort of the point: small things, done often, quietly add up. If you have read this far in a test post, the typography is probably doing its job.</p>
`;

const photoEssay = `
<p>Dummy post for local testing, with a photo in the middle so you can see how images sit inside the text column.</p>
<p>We left early, before the town woke up, and walked until the road turned into a path and the path into a guess. Nobody checked their phone for hours, mostly because there was no signal to check.</p>
<img src="${photo('inline-hills', 1400, 900)}" alt="">
<h2>Things worth remembering</h2>
<ol><li>The tea at the top tastes better than any tea at the bottom.</li><li>Pack one more layer than you think you need.</li><li>The best conversations happen on the way down.</li></ol>
<p>Back home, the photos look smaller than the day felt. That’s fine. This post is the bigger version.</p>
`;

const shortNote = `
<p>A short test note. Not every post needs to be long — some are just a thought worth keeping, with a <a href="https://example.com">link</a> or two.</p>
<p>Use posts like this to check how the page looks when there isn’t much text.</p>
`;

const review = `
<p>A test review used in local development — on the real site, this is where your own notes on the book go.</p>
<h2>What stuck</h2>
<p>The idea that small, repeatable choices matter more than big declarations. It is an easy point to agree with and a hard one to live by, which is probably why it keeps coming back.</p>
<h2>What didn’t</h2>
<p>Parts of the middle felt like the same argument made three ways. Skimming them lost nothing.</p>
<h2>Who should read it</h2>
<p>Anyone starting something new and looking for a gentle push, rather than a manual.</p>
`;

export function seed() {
  const posts = [
    { slug: 'a-year-of-morning-pages', title: 'What a year of writing every morning taught me', excerpt: 'One page a day, no editing. Here is what changed — and what didn’t.', cover: 'morning', body: essay, days: 3 },
    { slug: 'a-slow-weekend-in-the-hills', title: 'A slow weekend in the hills', excerpt: 'No signal, too much tea, and the best conversations on the way down.', cover: 'hills', body: photoEssay, days: 12 },
    { slug: 'learning-in-public', title: 'Learning in public, even when it’s awkward', excerpt: 'Why I started sharing half-finished things, and what happened next.', cover: null, body: essay, days: 26 },
    { slug: 'books-that-changed-my-evenings', title: 'The books that changed how I spend my evenings', excerpt: 'Swapping one hour of scrolling for one hour of reading.', cover: 'books', body: essay, days: 41 },
    { slug: 'why-i-keep-a-learning-log', title: 'Why I keep a learning log', excerpt: 'Little squares, big motivation.', cover: null, body: shortNote, days: 63 },
    { slug: 'notes-from-the-monsoon', title: 'Notes from the monsoon', excerpt: 'Rain, chai and an unplanned day off.', cover: 'monsoon', body: photoEssay, days: 90 },
    { slug: 'draft-thoughts-on-focus', title: 'Draft: half-finished thoughts on focus', excerpt: 'This one is a draft — it only shows up in the admin.', cover: null, body: shortNote, days: 1, draft: true },
  ].map((p) => ({
    id: crypto.randomUUID(),
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_url: p.cover ? photo(p.cover, 1600, 900) : null,
    content: p.body,
    published: !p.draft,
    published_at: stamp(p.days),
    created_at: stamp(p.days),
    updated_at: stamp(p.days),
  }));

  const book_reviews = [
    ['atomic-habits', 'Atomic Habits', 'James Clear', 5],
    ['deep-work', 'Deep Work', 'Cal Newport', 4],
    ['sapiens', 'Sapiens', 'Yuval Noah Harari', 5],
    ['the-psychology-of-money', 'The Psychology of Money', 'Morgan Housel', 4],
    ['ikigai', 'Ikigai', 'Héctor García & Francesc Miralles', 3],
    ['mans-search-for-meaning', 'Man’s Search for Meaning', 'Viktor E. Frankl', 5],
    ['the-alchemist', 'The Alchemist', 'Paulo Coelho', 3],
    ['thinking-fast-and-slow', 'Thinking, Fast and Slow', 'Daniel Kahneman', 4],
  ].map(([slug, title, author, rating], i) => ({
    id: crypto.randomUUID(),
    slug,
    title,
    author,
    cover_url: null,
    rating,
    content: review,
    finished_on: day(8 + i * 24),
    published: true,
    created_at: stamp(8 + i * 24),
    updated_at: stamp(8 + i * 24),
  }));

  const life_moments = [
    ['terrace', 'Sunday chai on the terrace', 5],
    ['trek', 'Trek, day two', 19],
    ['snow', 'First snow of the year', 34],
    ['bookshop', 'Book haul from the old market', 52],
    ['desk', 'Late-night coding session', 80],
    ['dinner', 'Family dinner', 110],
    ['rain', 'Monsoon walk', 150],
    ['beach', 'Sunset at the beach', 200],
  ].map(([seed, caption, days]) => ({
    id: crypto.randomUUID(),
    photo_url: photo(String(seed), 1200, 900),
    caption,
    happened_on: day(Number(days)),
    published: true,
    created_at: stamp(Number(days)),
  }));

  const skills = [
    ['React & TypeScript', 'course', 'learning', 'Building this very site with it.'],
    ['Public speaking', 'skill', 'learning', 'One short talk a month.'],
    ['AWS Cloud Practitioner', 'certificate', 'learning', null],
    ['Python for Everybody', 'course', 'done', 'Finished all five parts.'],
    ['Touch typing', 'skill', 'done', 'From 35 to 70 words per minute.'],
    ['Google Data Analytics', 'certificate', 'done', null],
  ].map(([name, kind, status, note], i) => ({
    id: crypto.randomUUID(),
    name,
    kind,
    status,
    link: null,
    note,
    created_at: stamp(i * 20),
  }));

  const learning_log = Array.from({ length: 180 }, (_, i) => i)
    .filter((i) => (i * 37 + (i % 5) * 11 + 3) % 9 >= 3)
    .map((i) => ({ id: crypto.randomUUID(), logged_on: day(i), minutes: [20, 45, 75, 150][(i * 7) % 4], note: null }));

  const site_settings = [
    {
      id: 1,
      intro: 'I write about the books I read, the things I’m learning, and the life in between.',
      quote: 'While we are postponing, life speeds by.',
      quote_author: 'Seneca',
      email: 'hello@example.com',
      instagram: 'https://instagram.com/',
      x: 'https://x.com/',
      linkedin: 'https://linkedin.com/',
      goodreads: 'https://goodreads.com/',
      avatar_url: null,
      updated_at: stamp(0),
    },
  ];

  // The test admin from the local login screen (see TEST_LOGIN in client.ts).
  const admins = [{ user_id: '00000000-0000-4000-8000-000000000001' }];

  return { posts, book_reviews, life_moments, skills, learning_log, site_settings, admins };
}
