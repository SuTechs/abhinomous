import { getBook, listBooks } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { Link } from '../router';
import { useAsync, useTitle } from '../hooks';
import { BookCard, BookCover, Loading, Notice, PageHeader, RichText, Stars } from '../components/Bits';
import { ArrowLeft } from '../components/Icons';
import { NotFound } from './NotFound';

export function Books() {
  useTitle('Book reviews');
  const { data: books, error, loading } = useAsync(() => listBooks(), []);
  return (
    <>
      <PageHeader eyebrow="03 / Reading" title="Book reviews" intro="Honest notes on what I read." />
      {loading && <Loading />}
      {error && <Notice>Couldn’t load reviews right now. Please try again in a moment.</Notice>}
      {books?.length === 0 && <Notice>No reviews yet — the shelf is filling up.</Notice>}
      {!!books?.length && (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 rounded-[36px] bg-white p-5 sm:grid-cols-3 sm:p-9 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

export function BookReview({ slug }: { slug: string }) {
  const { data: book, error, loading } = useAsync(() => getBook(slug), [slug]);
  useTitle(book?.title);

  if (loading) return <Loading />;
  if (error) return <Notice>Couldn’t load this review right now. Please try again in a moment.</Notice>;
  if (!book) return <NotFound />;

  return (
    <article className="pt-8 sm:pt-12">
      <Link to="/books" className="inline-flex items-center gap-2 rounded-full px-1 py-3 font-medium text-muted hover:text-ink">
        <ArrowLeft size={18} /> All reviews
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-12">
        <div className="mx-auto w-[min(260px,70%)] md:sticky md:top-28 md:w-full md:self-start">
          <BookCover book={book} index={0} />
        </div>
        <div className="flex flex-col gap-4">
          <Stars rating={book.rating} size={20} />
          <h1 className="m-0 text-[clamp(40px,6vw,72px)] leading-[0.98] font-extrabold tracking-[-0.045em]">{book.title}</h1>
          <p className="m-0 font-mono text-[13px] text-muted">
            {[book.author && `by ${book.author}`, book.finished_on && `finished ${formatDate(book.finished_on, { month: 'long', year: 'numeric' })}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="mt-4 rounded-[32px] bg-white px-6 py-8 sm:px-10 sm:py-10">
            <RichText html={book.content} />
          </div>
        </div>
      </div>
    </article>
  );
}
