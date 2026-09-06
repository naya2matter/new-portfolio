import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col font-sans">
      {/* Ambient wash. Pinned to the viewport rather than given a fixed pixel
          height — a height-bounded layer ends in a visible horizontal seam
          partway down the page. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="blob -left-40 -top-40 h-[34rem] w-[34rem] bg-eucalyptus-sage/50 dark:bg-eucalyptus-sage/12" />
        <div className="blob -right-40 top-1/4 h-[38rem] w-[38rem] bg-peach-veil/60 dark:bg-clay/10" />
        <div className="blob -bottom-40 left-1/4 h-[32rem] w-[32rem] bg-clay/20 dark:bg-clay/8" />
      </div>

      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
