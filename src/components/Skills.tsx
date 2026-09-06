"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  siBootstrap,
  siCss,
  siFigma,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNpm,
  siPostgresql,
  siPostman,
  siPrisma,
  siReact,
  siRedux,
  siTailwindcss,
  siTypescript,
  siVercel,
} from "simple-icons";
import {
  Gauge,
  Layers,
  Package,
  RefreshCw,
  Server,
  ShieldCheck,
  Share2,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";

type BrandItem = {
  kind: "brand";
  label: string;
  path: string;
  hex: string;
  // Marks that are pure black/near-black in their real brand colour — on a
  // transparent background those would vanish on the dark theme and blend
  // flat into the light one, so they render in `currentColor` and shift with
  // the page's own foreground token instead of a fixed hex.
  monochrome?: boolean;
};

// `key` is the English identifier used to look up the translated label in
// content.skills.concepts — see en.json / ar.json.
type ConceptItem = { kind: "concept"; key: string; Icon: LucideIcon };

type Item = BrandItem | ConceptItem;

const BRANDS: Item[] = [
  { kind: "brand", label: "JavaScript", path: siJavascript.path, hex: siJavascript.hex },
  { kind: "brand", label: "TypeScript", path: siTypescript.path, hex: siTypescript.hex },
  { kind: "brand", label: "React.js", path: siReact.path, hex: siReact.hex },
  { kind: "brand", label: "Next.js", path: siNextdotjs.path, hex: siNextdotjs.hex, monochrome: true },
  { kind: "brand", label: "HTML5", path: siHtml5.path, hex: siHtml5.hex },
  { kind: "brand", label: "CSS3", path: siCss.path, hex: siCss.hex },
  { kind: "brand", label: "Redux", path: siRedux.path, hex: siRedux.hex },
  { kind: "brand", label: "Tailwind CSS", path: siTailwindcss.path, hex: siTailwindcss.hex },
  { kind: "brand", label: "Bootstrap", path: siBootstrap.path, hex: siBootstrap.hex },
  { kind: "brand", label: "Figma", path: siFigma.path, hex: siFigma.hex },
  { kind: "brand", label: "Prisma", path: siPrisma.path, hex: siPrisma.hex, monochrome: true },
  { kind: "brand", label: "MySQL", path: siMysql.path, hex: siMysql.hex },
  { kind: "brand", label: "PostgreSQL", path: siPostgresql.path, hex: siPostgresql.hex },
  { kind: "brand", label: "MongoDB", path: siMongodb.path, hex: siMongodb.hex },
  { kind: "brand", label: "Git", path: siGit.path, hex: siGit.hex },
  { kind: "brand", label: "GitHub", path: siGithub.path, hex: siGithub.hex, monochrome: true },
  { kind: "brand", label: "Postman", path: siPostman.path, hex: siPostman.hex },
  { kind: "brand", label: "Vercel", path: siVercel.path, hex: siVercel.hex, monochrome: true },
  { kind: "brand", label: "npm", path: siNpm.path, hex: siNpm.hex },
];

// No brand mark exists for these — represented with a plain line icon instead
// of being dropped into a separate text sentence, so every skill on the CV
// gets the same visual treatment in one continuous strip.
const CONCEPTS: Item[] = [
  { kind: "concept", key: "Redux Toolkit", Icon: Package },
  { kind: "concept", key: "Context API", Icon: Share2 },
  { kind: "concept", key: "Responsive Design", Icon: Smartphone },
  { kind: "concept", key: "RESTful APIs", Icon: Server },
  { kind: "concept", key: "Full SDLC", Icon: RefreshCw },
  { kind: "concept", key: "Performance Optimization", Icon: Gauge },
  { kind: "concept", key: "Middleware", Icon: Layers },
  { kind: "concept", key: "Auth & Security", Icon: ShieldCheck },
];

const ITEMS: Item[] = [...BRANDS, ...CONCEPTS];

function ItemGlyph({ item, label }: { item: Item; label: string }) {
  return (
    <span className="group flex shrink-0 items-center gap-3 px-8" title={label}>
      {item.kind === "brand" ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-7 w-7 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110"
          style={{ fill: item.monochrome ? "currentColor" : `#${item.hex}` }}
        >
          <path d={item.path} />
        </svg>
      ) : (
        <item.Icon
          aria-hidden
          className="h-6 w-6 shrink-0 text-accent transition-transform duration-300 ease-out group-hover:scale-110"
          strokeWidth={1.75}
        />
      )}
      <span className="font-mono text-xs whitespace-nowrap text-muted transition-colors duration-300 group-hover:text-foreground">
        {label}
      </span>
    </span>
  );
}

function labelFor(item: Item, concepts: Record<string, string>) {
  return item.kind === "brand" ? item.label : (concepts[item.key] ?? item.key);
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const marqueeTweenRef = useRef<gsap.core.Tween | null>(null);
  const { content } = useLanguage();

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // The section arrives as one whole envelope, rising into place just
      // before its own contents start revealing themselves below.
      if (!reduceMotion) {
        gsap.from(sectionRef.current, {
          y: 56,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 95%" },
        });
      }

      gsap.from("[data-skill-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      if (reduceMotion) return;

      // The track renders the full item list twice back to back; travelling
      // exactly -50% lands on the duplicate's start, so the loop repeats with
      // no jump or visible seam.
      marqueeTweenRef.current = gsap.to("[data-track]", {
        xPercent: -50,
        duration: 52,
        ease: "none",
        repeat: -1,
      });

      // Scroll-velocity reactive skew + speed — the strip briefly leans and
      // accelerates with how fast you scroll, then eases flat again, instead
      // of drifting at one constant, indifferent pace the whole time.
      if (!trackRef.current) return;
      const skewSetter = gsap.quickSetter(trackRef.current, "skewX", "deg");
      const clampSkew = gsap.utils.clamp(-6, 6);
      const clampSpeed = gsap.utils.clamp(0.5, 4);
      const skewState = { value: 0 };

      const velocityTrigger = ScrollTrigger.create({
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          skewState.value = clampSkew(velocity / -300);
          skewSetter(skewState.value);
          gsap.to(skewState, {
            value: 0,
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
            onUpdate: () => skewSetter(skewState.value),
          });

          marqueeTweenRef.current?.timeScale(
            clampSpeed(1 + Math.abs(velocity) / 900),
          );
        },
      });

      return () => velocityTrigger.kill();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="skills" className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-baseline lg:gap-6 lg:text-left">
          <p
            data-skill-reveal
            className="shrink-0 font-mono text-xs tracking-[0.2em] text-muted uppercase"
          >
            {content.skills.eyebrow}
          </p>
          <h2
            data-skill-reveal
            data-theme-impact
            className="font-display text-2xl leading-[1.2] tracking-tight text-foreground sm:text-3xl lg:whitespace-nowrap"
          >
            {content.skills.headline}
          </h2>
        </div>

        {/* Contained to the same column as the heading — not full-bleed — so
            the fade starts at the exact edge everything else in the section
            starts from, instead of the raw viewport edge. */}
        <div
          data-skill-reveal
          dir="ltr"
          onMouseEnter={() => marqueeTweenRef.current?.pause()}
          onMouseLeave={() => marqueeTweenRef.current?.play()}
          className="mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        >
          {/* Forced LTR: the infinite loop below relies on the untransformed
              track resting flush against the container's LEFT edge (xPercent
              -50 then lands exactly on the duplicate's start). Under the
              page's own RTL, a shrink-to-fit block instead rests flush right,
              so the translate carries it off in the wrong direction and only
              a sliver of one item is ever visible. The strip is a set of
              independent labels, not a sentence, so pinning it to LTR here
              doesn't affect reading order — individual Arabic labels still
              shape correctly within it. */}
          <div ref={trackRef} data-track className="flex w-max items-center">
            {[...ITEMS, ...ITEMS].map((item, index) => {
              const id = item.kind === "brand" ? item.label : item.key;
              return (
                <ItemGlyph
                  key={`${id}-${index}`}
                  item={item}
                  label={labelFor(item, content.skills.concepts)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
