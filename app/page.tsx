import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { Hero, Ticker, Resting } from "@/app/components/home/sections";
import { Famous, Worlds, LastSignals, RoverModel } from "@/app/components/home/highlights";
import { RevealManager } from "@/app/components/scroll-fx";
import { JrSection } from "@/app/components/home/jr-section";
import { BooksSection } from "@/app/components/home/books-section";
import { GamesSection } from "@/app/components/home/games-section";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-white text-ink">
        <Hero />
        <Ticker />
        <Famous />
        <JrSection />
        <Worlds />
        <BooksSection />
        <GamesSection />
        <LastSignals />
        <RoverModel />
        <Resting />
      </main>
      <Footer />
      <RevealManager />
    </>
  );
}
