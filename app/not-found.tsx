import Link from "next/link";
import Header from "@/app/components/header";
import { Waveform } from "@/app/components/waveform";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-center px-4 py-20 sm:px-8">
        <p className="font-mono text-sm text-brand">404 · no signal</p>
        <h1 className="display mt-3 text-5xl lg:text-7xl">We lost contact with this page.</h1>
        <Waveform seed="404" bars={30} fade={0.6} className="mt-8 h-12 w-72 text-brand" />
        <Link href="/" className="mt-8 font-semibold text-brand hover:underline">Back to the archive →</Link>
      </main>
    </>
  );
}
