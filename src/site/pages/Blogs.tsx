import { getPost, listPosts } from '../../lib/api';
import { formatDate, readingMinutes } from '../../lib/format';
import { Link } from '../router';
import { useAsync, useTitle } from '../hooks';
import { Loading, Notice, PageHeader, PostCard, RichText } from '../components/Bits';
import { ArrowLeft } from '../components/Icons';
import { NotFound } from './NotFound';

export function Blogs() {
  useTitle('Blogs');
  const { data: posts, error, loading } = useAsync(() => listPosts(), []);
  return (
    <>
      <PageHeader eyebrow="01 / Writing" title="Blogs" intro="Long-form thoughts and short notes." />
      {loading && <Loading />}
      {error && <Notice>Couldn’t load posts right now. Please try again in a moment.</Notice>}
      {posts?.length === 0 && <Notice>No posts yet — the first one is on its way.</Notice>}
      {!!posts?.length && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

export function BlogPost({ slug }: { slug: string }) {
  const { data: post, error, loading } = useAsync(() => getPost(slug), [slug]);
  const { data: more } = useAsync(() => listPosts(4), []);
  useTitle(post?.title);

  if (loading) return <Loading />;
  if (error) return <Notice>Couldn’t load this post right now. Please try again in a moment.</Notice>;
  if (!post) return <NotFound />;

  const others = (more ?? []).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article className="pt-8 sm:pt-12">
      <Link to="/blogs" className="inline-flex items-center gap-2 rounded-full px-1 py-3 font-medium text-muted hover:text-ink">
        <ArrowLeft size={18} /> All posts
      </Link>

      {post.cover_url && (
        <img src={post.cover_url} alt="" className="mt-4 aspect-[4/3] w-full rounded-[28px] object-cover sm:aspect-[21/9] sm:rounded-[36px]" />
      )}

      <header className="mx-auto mt-10 flex max-w-[68ch] flex-col gap-4 sm:mt-14">
        <span className="font-mono text-[13px] text-cobalt">
          {formatDate(post.published_at)} · {readingMinutes(post.content)} min read
        </span>
        <h1 className="m-0 text-[clamp(40px,6vw,76px)] leading-[0.98] font-extrabold tracking-[-0.045em]">{post.title}</h1>
        {post.excerpt && <p className="m-0 text-xl leading-relaxed text-muted">{post.excerpt}</p>}
      </header>

      <div className="mx-auto mt-10 max-w-[68ch] rounded-[32px] bg-white px-6 py-8 sm:px-12 sm:py-12">
        <RichText html={post.content} />
      </div>

      {others.length > 0 && (
        <section aria-labelledby="more-heading" className="mt-16">
          <h2 id="more-heading" className="mb-6 px-1 text-[40px] leading-none font-extrabold tracking-[-0.04em]">
            Keep reading
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p, i) => (
              <PostCard key={p.id} post={p} index={i + 1} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
