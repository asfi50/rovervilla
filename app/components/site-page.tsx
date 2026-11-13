import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { RevealManager } from "@/app/components/scroll-fx";

/** Standard inner page: eyebrow, big title, optional lede, then the content. */
export default function SitePage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-[1440px] px-4 pt-7 pb-14 sm:px-8 sm:pt-10 sm:pb-20 lg:pt-14 lg:pb-28">
          <p className="rise">
            <span className="sticker bg-brand-soft text-brand">{eyebrow}</span>
          </p>
          <h1 className="display rise mt-3.5 max-w-[16ch] text-[40px] sm:mt-5 sm:text-5xl lg:text-[80px]" style={{ animationDelay: "60ms" }}>
            {title}
          </h1>
          {lede && (
            <p className="rise mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft sm:mt-5 sm:text-lg" style={{ animationDelay: "120ms" }}>
              {lede}
            </p>
          )}
          <div className="mt-6 sm:mt-10 lg:mt-14">{children}</div>
        </div>
      </main>
      <Footer />
      <RevealManager />
    </>
  );
}
