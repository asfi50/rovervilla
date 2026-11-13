import Link from "next/link";
import BookCover, { type CoverData } from "@/app/components/books/cover";

/** A book on a shelf: the cover lifts toward you on hover, title and narrator underneath. */
export default function BookTile({ slug, book, sizes = "200px", className = "" }: { slug: string; book: CoverData; sizes?: string; className?: string }) {
  return (
    <Link href={`/books/${slug}`} className={`group/book block outline-none ${className}`}>
      <div className="relative transition-transform duration-500 ease-out group-hover/book:-translate-y-1.5 group-focus-visible/book:-translate-y-1.5">
        <BookCover
          book={book}
          sizes={sizes}
          className="shadow-[0_18px_30px_-16px_rgba(13,11,38,0.55),0_2px_6px_rgba(13,11,38,0.12)] transition-shadow duration-500 group-hover/book:shadow-[0_30px_44px_-18px_rgba(13,11,38,0.6),0_2px_6px_rgba(13,11,38,0.12)] group-focus-visible/book:ring-3 group-focus-visible/book:ring-brand"
        />
      </div>
      <p className="mt-3 line-clamp-2 text-[15px] leading-snug font-semibold text-ink">{book.title}</p>
      <p className="mt-0.5 text-[13px] text-ink-soft">
        {book.name} · {book.chapters} chapters
      </p>
    </Link>
  );
}
