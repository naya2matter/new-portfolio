import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import { GlassShineInit } from "@/components/GlassShineInit";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col font-sans">
      {/* Painted backdrop pinned to the viewport; all content scrolls over it. */}
      <AmbientBackdrop />
      <GlassShineInit />

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
