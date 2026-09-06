"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowUpRight, Lock, X } from "lucide-react";
import { siGithub } from "simple-icons";
import { gsap } from "@/lib/gsap";
import { useLanguage, interpolate } from "@/lib/language";
import ScreenshotSlider from "./ScreenshotSlider";
import type { CarouselItem } from "./DepthCarousel";

export type ModalProject = {
  name: string;
  org: string;
  year: string;
  summary: string;
  highlights: string[];
  stack: string[];
  repo?: string;
  live?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  gallery?: CarouselItem[];
  access: "public" | "internal";
};

interface ProjectModalProps {
  project: ModalProject | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);
  const closingRef = useRef(false);
  const { content } = useLanguage();

  // Plays the exit timeline first, then hands control back to the parent,
  // which is what actually unmounts. Guarded so a double Escape (or Escape
  // plus a backdrop click) cannot start two overlapping exits.
  const requestClose = useCallback(() => {
    if (closingRef.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !panelRef.current || !backdropRef.current) {
      onClose();
      return;
    }

    closingRef.current = true;
    gsap
      .timeline({
        onComplete: () => {
          closingRef.current = false;
          onClose();
        },
      })
      .to(panelRef.current, {
        y: 18,
        scale: 0.975,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      })
      .to(backdropRef.current, { opacity: 0, duration: 0.25, ease: "none" }, 0.05);
  }, [onClose]);

  useEffect(() => {
    if (!project) return;

    restoreFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      (restoreFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [project, requestClose]);

  // Entrance. Runs on open only; the exit is driven imperatively above so the
  // element survives long enough to animate out.
  useEffect(() => {
    if (!project) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "none" },
        )
        .fromTo(
          panelRef.current,
          { y: 26, scale: 0.97, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: "power3.out" },
          0.05,
        )
        .from(
          "[data-modal-stagger]",
          {
            y: 16,
            opacity: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: "power2.out",
            clearProps: "transform,opacity",
          },
          0.18,
        );
    });

    return () => ctx.revert();
  }, [project]);

  if (!project || typeof document === "undefined") return null;

  const internal = project.access === "internal";
  const hasGallery = !!project.gallery && project.gallery.length > 0;

  return createPortal(
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={interpolate(content.projectModal.dialogLabel, { name: project.name })}
      className="fixed inset-0 z-[100] bg-background/85 backdrop-blur-md"
      onClick={requestClose}
    >
      <div
        ref={panelRef}
        className="flex h-dvh w-full flex-col overflow-y-auto overscroll-contain"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-8">
          <div className="flex items-start justify-between gap-6">
            <div data-modal-stagger>
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
                {project.org} · {project.year}
              </p>
              <h2 className="mt-1.5 font-display text-2xl leading-tight text-foreground sm:text-3xl">
                {project.name}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={requestClose}
              aria-label={content.projectModal.close}
              className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-6 grid flex-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
            <div
              data-modal-stagger
              // A real height, not just a minimum — otherwise a full-page
              // screenshot's natural height stretches this box (and the
              // whole modal page) to match it, leaving the detail column
              // beside it mostly empty. Capped, the tall image scrolls
              // inside its own box instead, the way an image-search preview
              // does; the slider fills this same box regardless.
              className="h-[62vh] min-h-[320px] sm:h-[68vh] sm:min-h-[440px] lg:h-[72vh] lg:min-h-[560px]"
            >
              {hasGallery ? (
                <div className="glass relative h-full w-full overflow-hidden rounded-2xl">
                  <ScreenshotSlider
                    key={project.name}
                    items={project.gallery ?? []}
                    title={project.name}
                  />
                </div>
              ) : project.image && project.imageWidth && project.imageHeight ? (
                // Full-page screenshots run many times taller than wide —
                // squeezing one into a fixed box shrinks the text past
                // reading size. Render at natural aspect, full panel width,
                // and let the panel scroll vertically instead, the same way
                // an image search's full-preview view works.
                <div className="glass relative h-full w-full overflow-y-auto overscroll-contain rounded-2xl">
                  <Image
                    src={project.image}
                    alt={interpolate(content.projectModal.interfaceAlt, { name: project.name })}
                    width={project.imageWidth}
                    height={project.imageHeight}
                    sizes="(min-width: 1024px) 780px, 100vw"
                    quality={95}
                    className="h-auto w-full"
                    priority
                  />
                </div>
              ) : project.image ? (
                <div className="glass relative h-full w-full overflow-hidden rounded-2xl">
                  <Image
                    src={project.image}
                    alt={interpolate(content.projectModal.interfaceAlt, { name: project.name })}
                    fill
                    sizes="(min-width: 1024px) 900px, 100vw"
                    quality={95}
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="glass flex h-full w-full items-center justify-center rounded-2xl">
                  <p className="max-w-xs px-6 text-center text-sm leading-relaxed text-muted">
                    {content.projectModal.noScreenshots}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col pb-6">
              <p
                data-modal-stagger
                className="text-sm leading-relaxed text-foreground/85"
              >
                {project.summary}
              </p>

              <ul data-modal-stagger className="mt-5 space-y-2">
                {project.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-2.5 text-[13px] leading-relaxed text-muted"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <ul data-modal-stagger className="mt-6 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-(--glass-border) px-2.5 py-1 font-mono text-[10px] tracking-wide text-muted"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              {hasGallery && (
                <p
                  data-modal-stagger
                  className="mt-5 font-mono text-[11px] tracking-[0.14em] text-muted uppercase"
                >
                  {interpolate(content.projectModal.screenshotsNote, {
                    count: project.gallery?.length ?? 0,
                  })}
                </p>
              )}

              <div
                data-modal-stagger
                className="mt-auto flex flex-wrap items-center gap-3 pt-7"
              >
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="glass flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium text-foreground transition-transform hover:-translate-y-0.5"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                      <path d={siGithub.path} />
                    </svg>
                    {content.projectModal.source}
                  </a>
                )}

                {!project.repo && (
                  <span className="flex items-center gap-1.5 text-[13px] text-muted/80">
                    <Lock className="h-3 w-3" strokeWidth={2.5} />
                    {content.projectModal.sourcePrivate}
                  </span>
                )}

                {project.live && !internal && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[13px] font-medium text-forest-ink transition-transform hover:-translate-y-0.5"
                  >
                    {content.projectModal.visitLive}
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </a>
                )}

                {project.live && internal && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-(--glass-border) px-4 py-2.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
                  >
                    <Lock className="h-3 w-3" strokeWidth={2.5} />
                    {content.projectModal.liveStaff}
                  </a>
                )}

                {internal && !project.live && (
                  <span className="text-[13px] text-muted/80">
                    {content.projectModal.walkthroughOnRequest}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
