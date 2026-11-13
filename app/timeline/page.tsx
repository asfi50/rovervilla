import { HEROES } from "@/lib/heroes";
import { generateSEO } from "@/lib/seo";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import TimelineView from "@/app/components/timeline/timeline-view";

export const metadata = generateSEO({
  title: "Timeline: every machine on one axis | Rover Villa",
  description: "From Ranger 7 in 1964 to today: every rover, lander and probe we left on Mars and the Moon, on one timeline.",
  path: "/timeline",
});

export default function TimelinePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-mist">
        <TimelineView heroes={HEROES} />
      </main>
      <Footer />
    </>
  );
}
