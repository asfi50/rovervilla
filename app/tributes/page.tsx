import { HEROES } from "@/lib/heroes";
import { generateSEO } from "@/lib/seo";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import TributesView from "@/app/components/tributes-view";

export const metadata = generateSEO({
  title: "Tributes | Rover Villa",
  description: "Leave a message for the machines that went where we couldn’t.",
  path: "/tributes",
});

export default function TributesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-night text-white">
        <TributesView heroes={HEROES} />
      </main>
      <Footer />
    </>
  );
}
