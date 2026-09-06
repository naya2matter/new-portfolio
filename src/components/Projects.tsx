"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { ArrowUpRight, GraduationCap, Images, Lock, Puzzle } from "lucide-react";
import { siGithub } from "simple-icons";
import { gsap } from "@/lib/gsap";
import { useLanguage, interpolate } from "@/lib/language";
import { PROJECTS_MEDIA, PROJECT_ORDER, SITE_LINKS } from "@/content/media";
import ProjectModal from "./ProjectModal";

type Project = {
  id: string;
  name: string;
  org: string;
  year: string;
  summary: string;
  highlights: string[];
  stack: string[];
  // Absent for the rare project whose source can't be shared at all
  // (client confidentiality) — everything else has a real, readable repo.
  repo?: string;
  // Absent for the internal apps: their deployments sit behind a company
  // login, so a "Live" button would send visitors to a sign-in wall.
  live?: string;
  // Screenshot under public/images/projects/. Carries most of the weight for
  // the internal apps, where it is the only thing a visitor can actually see.
  image?: string;
  // Crop anchor for `image`. Defaults to "top" (right for a tall page
  // screenshot); "center" is for a screenshot whose real content sits away
  // from the top edge (e.g. a popup card in an otherwise-empty window).
  imagePosition?: "top" | "center";
  // Full screenshot set, browsable in the DepthCarousel modal. Most useful on
  // the internal apps, where this is the only way to actually see the app.
  gallery?: import("./DepthCarousel").CarouselItem[];
  access: "public" | "internal";
  // Bento span on the widest breakpoint. Two wide tiles per three-column row
  // keeps the mosaic irregular without leaving holes in the grid.
  wide?: boolean;
  // Real pixel dimensions of `image`, only needed for single-image projects
  // (no gallery). Full-page screenshots run many times taller than wide —
  // the modal renders them at natural aspect and lets the panel scroll,
  // instead of squeezing them into a fixed box until they're unreadable.
  imageWidth?: number;
  imageHeight?: number;
  // Only for the entries with no screenshots yet — picks the placeholder mark
  // so the tile still reads as designed rather than broken.
  fallbackIcon?: "courses" | "extension";
  // Headline figure shown on those same screenshot-less tiles.
  statValue?: string;
};

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d={siGithub.path} />
    </svg>
  );
}


const FILTER_IDS = ["all", "public", "internal"] as const;
type FilterId = (typeof FILTER_IDS)[number];

// The window chrome every tile wears. Giving a bright marketing screenshot and
// a dark dashboard the same frame is what stops them reading as a pile of
// mismatched images — the frame becomes the constant, the content varies.
function WindowChrome() {
  return (
    <div
      aria-hidden
      className="flex h-7 shrink-0 items-center gap-1.5 border-b border-(--glass-border) bg-foreground/[0.04] px-3"
    >
      <span className="h-2 w-2 rounded-full bg-foreground/20" />
      <span className="h-2 w-2 rounded-full bg-foreground/15" />
      <span className="h-2 w-2 rounded-full bg-foreground/10" />
    </div>
  );
}

// Stand-in art for the projects with no screenshots yet. A composed
// typographic card — the headline figure that actually says something about
// the project — reads as deliberate; a lone icon on a gradient reads as a
// missing image.
function FallbackArt({
  kind,
  statValue,
  statLabel,
}: {
  kind: "courses" | "extension";
  statValue?: string;
  statLabel?: string;
}) {
  const Icon = kind === "courses" ? GraduationCap : Puzzle;
  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden bg-gradient-to-br from-eucalyptus-sage/20 via-peach-veil/10 to-clay/20 px-5 dark:from-eucalyptus-sage/10 dark:via-clay/5 dark:to-clay/12">
      <Icon
        className="absolute -right-4 -bottom-4 h-28 w-28 text-accent/10 transition-transform duration-700 group-hover:scale-110"
        strokeWidth={1}
        aria-hidden
      />
      {statValue && (
        <p className="relative font-display text-5xl leading-none text-accent/80">
          {statValue}
        </p>
      )}
      {statLabel && (
        <p className="relative mt-2 max-w-[14rem] font-mono text-[10px] leading-relaxed tracking-[0.14em] text-muted uppercase">
          {statLabel}
        </p>
      )}
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tabsWrapRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Partial<Record<FilterId, HTMLButtonElement | null>>>({});
  // Tracks the last filter value the resettle effect actually processed, so
  // it can compare VALUES rather than a "have I run once" boolean — a
  // boolean flips permanently on the first pass, but React 19's dev-mode
  // Strict Mode re-invokes this effect a second time with the SAME filter
  // value right after (mount, cleanup, mount again). A boolean guard reads
  // that second invoke as "already mounted, so this must be real" and fires
  // the animation on load, its `killTweensOf` wiping out the scroll-in
  // entrance below and leaving every card permanently at opacity 0 with no
  // trigger left to reveal it. Comparing the value survives that replay: both
  // invocations see the same filter, so neither is mistaken for a real change.
  const prevFilterRef = useRef<FilterId | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [active, setActive] = useState<Project | null>(null);
  const { content, locale } = useLanguage();

  const FILTERS = FILTER_IDS.map((id) => ({ id, label: content.projects.filters[id] }));

  // Words come from content.projects.items (see en.json / ar.json), links and
  // media come from PROJECTS_MEDIA — joined here by id.
  const PROJECTS: Project[] = useMemo(
    () =>
      PROJECT_ORDER.map((id) => ({
        ...PROJECTS_MEDIA[id],
        ...content.projects.items[id as keyof typeof content.projects.items],
      })),
    [content],
  );

  const visible = useMemo(
    () => (filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.access === filter)),
    [filter, PROJECTS],
  );

  const counts = useMemo(
    () => ({
      all: PROJECTS.length,
      public: PROJECTS.filter((p) => p.access === "public").length,
      internal: PROJECTS.filter((p) => p.access === "internal").length,
    }),
    [PROJECTS],
  );

  useGSAP(
    () => {
      // The section arrives as one whole envelope, rising into place just
      // before its own contents start revealing themselves below.
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.from(sectionRef.current, {
          y: 56,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 95%" },
        });
      }

      gsap.from("[data-proj-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      // Per-tile triggers so each animates as it crosses the threshold rather
      // than the whole grid firing at the section's top edge. A touch of
      // scale and a back-out ease give the grid its own distinct settle,
      // instead of reusing the identical rise every other section uses.
      gsap.utils.toArray<HTMLElement>("[data-proj-card]").forEach((card, index) => {
        gsap.from(card, {
          y: 34,
          opacity: 0,
          scale: 0.94,
          duration: 0.8,
          delay: (index % 3) * 0.06,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: card, start: "top 90%" },
        });
      });

      // Tiles tilt toward the cursor and lift slightly — the grid's own
      // mouse-reactive touch, distinct from the scroll-driven motion above.
      if (window.matchMedia("(pointer: fine)").matches) {
        const cleanupFns: (() => void)[] = [];
        gsap.utils.toArray<HTMLButtonElement>("[data-proj-card]").forEach((card) => {
          const setRotateX = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power3.out" });
          const setRotateY = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power3.out" });
          const setY = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3.out" });

          const onMove = (event: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            setRotateY(px * 9);
            setRotateX(py * -9);
          };
          const onEnter = () => setY(-6);
          const onLeave = () => {
            setY(0);
            setRotateX(0);
            setRotateY(0);
          };

          card.addEventListener("mousemove", onMove);
          card.addEventListener("mouseenter", onEnter);
          card.addEventListener("mouseleave", onLeave);
          cleanupFns.push(() => {
            card.removeEventListener("mousemove", onMove);
            card.removeEventListener("mouseenter", onEnter);
            card.removeEventListener("mouseleave", onLeave);
          });
        });

        return () => cleanupFns.forEach((fn) => fn());
      }
    },
    { scope: sectionRef },
  );

  // Sliding pill behind the active filter tab — measured from the real
  // button position so it works regardless of label width or wrapping.
  useGSAP(
    () => {
      const btn = tabRefs.current[filter];
      const wrap = tabsWrapRef.current;
      const pill = pillRef.current;
      if (!btn || !wrap || !pill) return;

      const wrapBox = wrap.getBoundingClientRect();
      const btnBox = btn.getBoundingClientRect();

      gsap.to(pill, {
        x: btnBox.left - wrapBox.left,
        y: btnBox.top - wrapBox.top,
        width: btnBox.width,
        height: btnBox.height,
        duration: 0.45,
        ease: "power3.out",
      });
    },
    { dependencies: [filter, locale], scope: sectionRef },
  );

  // Re-runs on every filter change so the surviving tiles settle into their
  // new positions instead of snapping — but NOT on the initial mount, where
  // it would fight the scroll-triggered entrance above for the same
  // opacity/transform and win (via overwrite), leaving cards permanently
  // visible-then-orphaned with no ScrollTrigger left to reveal the ones
  // still below the fold. By the time a real filter click happens the
  // section is already in view, so there's no scroll-gating to preserve.
  useGSAP(
    () => {
      const isRealChange =
        prevFilterRef.current !== null && prevFilterRef.current !== filter;
      prevFilterRef.current = filter;
      if (!isRealChange) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.killTweensOf("[data-proj-card]");
      gsap.fromTo(
        "[data-proj-card]",
        { opacity: 0, y: 18, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.out",
        },
      );
    },
    { scope: gridRef, dependencies: [filter] },
  );

  return (
    <section ref={sectionRef} id="projects" className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-baseline lg:gap-6 lg:text-left">
          <p
            data-proj-reveal
            className="shrink-0 font-mono text-xs tracking-[0.2em] text-muted uppercase"
          >
            {content.projects.eyebrow}
          </p>
          <h2
            data-proj-reveal
            data-theme-impact
            className="font-display text-2xl leading-[1.2] tracking-tight text-foreground sm:text-3xl"
          >
            {content.projects.headline}
          </h2>
        </div>

        <div
          ref={tabsWrapRef}
          data-proj-reveal
          className="relative mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
          role="tablist"
          aria-label={content.projects.filterAriaLabel}
        >
          <span
            ref={pillRef}
            aria-hidden
            className="absolute top-0 left-0 z-0 h-0 w-0 rounded-full bg-accent"
          />
          {FILTERS.map((option) => {
            const selected = filter === option.id;
            return (
              <button
                key={option.id}
                ref={(el) => {
                  tabRefs.current[option.id] = el;
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(option.id)}
                className={`relative z-10 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-300 ${
                  selected
                    ? "text-forest-ink"
                    : "border border-(--glass-border) text-muted hover:text-foreground"
                }`}
              >
                {option.label}
                <span className={selected ? "ml-1.5 opacity-60" : "ml-1.5 opacity-45"}>
                  {counts[option.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={gridRef}
          style={{ perspective: 1200 }}
          className="mt-8 grid auto-rows-[310px] grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-flow-dense lg:grid-cols-3"
        >
          {visible.map((project) => {
            const internal = project.access === "internal";
            const projectContent =
              content.projects.items[project.id as keyof typeof content.projects.items];
            const statLabel =
              "statLabel" in projectContent ? projectContent.statLabel : undefined;

            return (
              <button
                key={project.id}
                type="button"
                data-proj-card
                onClick={() => setActive(project)}
                aria-label={interpolate(content.projects.openDetails, { name: project.name })}
                className={`group glass relative flex flex-col overflow-hidden rounded-2xl text-left ${
                  project.wide ? "sm:col-span-2" : ""
                }`}
              >
                <WindowChrome />

                {/* The screenshot sits in its own framed viewport rather than
                    bleeding behind the label — no scrim needed, so text is
                    never fighting whatever happens to be under it. */}
                <div className="relative flex-1 overflow-hidden">
                  {project.image ? (
                    <>
                      <Image
                        src={project.image}
                        alt={interpolate(content.projectModal.interfaceAlt, {
                          name: project.name,
                        })}
                        fill
                        sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                        // Held slightly back at rest and brought to full
                        // strength on hover, so the tile you're pointing at is
                        // the brightest thing in the grid — and so a stark
                        // white marketing shot stops glaring against the dark
                        // theme while it's just sitting there.
                        className={`object-cover saturate-[0.92] transition-all duration-700 group-hover:scale-[1.04] group-hover:saturate-100 dark:brightness-[0.78] dark:group-hover:brightness-100 ${
                          project.imagePosition === "center" ? "object-center" : "object-top"
                        }`}
                      />
                      {/* Unifying wash — one warm tint over every screenshot,
                          light or dark, so the grid reads as a set. */}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-accent/[0.07] transition-opacity duration-700 group-hover:opacity-0"
                      />
                    </>
                  ) : (
                    <FallbackArt
                      kind={project.fallbackIcon ?? "courses"}
                      statValue={project.statValue}
                      statLabel={statLabel}
                    />
                  )}
                </div>

                <div className="shrink-0 border-t border-(--glass-border) bg-background/40 p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
                      {project.org}
                    </p>
                    {internal && (
                      <Lock className="h-2.5 w-2.5 text-muted" strokeWidth={3} aria-hidden />
                    )}
                    {project.gallery && (
                      <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-muted">
                        <Images className="h-3 w-3" strokeWidth={2.5} />
                        {project.gallery.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <h3 className="font-display text-lg leading-snug text-foreground">
                      {project.name}
                    </h3>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </div>

                  {/* Always visible now — the stack is the fastest signal of
                      what a project actually is, so it shouldn't be gated
                      behind a hover. */}
                  <p className="mt-1.5 truncate font-mono text-[10px] tracking-wide text-muted/80">
                    {project.stack.slice(0, 4).join(" · ")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p
          data-proj-reveal
          className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted lg:mx-0 lg:text-left"
        >
          {content.projects.footerNote}
        </p>

        <div data-proj-reveal className="mt-6 flex justify-center lg:justify-start">
          <a
            href={SITE_LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="glass flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm text-foreground transition-transform hover:-translate-y-0.5"
          >
            <GithubMark className="h-4 w-4" />
            {content.projects.allRepos}
            <ArrowUpRight className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
          </a>
        </div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
