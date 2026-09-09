"use client";

import { useActionState, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Loader2, Mail, Phone, Send } from "lucide-react";
import { siGithub, siTelegram, siWhatsapp } from "simple-icons";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";
import { SITE_LINKS } from "@/content/media";
import { sendContactMessage, type ContactState } from "@/app/actions";

const INITIAL_STATE: ContactState = { status: "idle", messageKey: null };

type Channel = "telegram" | "whatsapp";

// Cursor-tracked radial highlight — the "glass lit up by your mouse" effect
// from the reference boards. Plain CSS custom properties, not GSAP: a
// spotlight should follow the cursor 1:1, and spring/eased easing here would
// make it visibly lag instead of feeling attached to the pointer.
function onSpotlightMove(event: ReactMouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const { content } = useLanguage();
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendContactMessage,
    INITIAL_STATE,
  );
  // Which app the visitor wants to reach out on — picked once, right above
  // the submit button, so the form sends through exactly one channel
  // instead of always doing both.
  const [channel, setChannel] = useState<Channel>("telegram");

  const CHANNELS = [
    {
      label: content.contact.channels.email,
      value: SITE_LINKS.email,
      href: `mailto:${SITE_LINKS.email}`,
      icon: Mail,
    },
    {
      label: content.contact.channels.phone,
      value: SITE_LINKS.phoneDisplay,
      href: `tel:+${SITE_LINKS.whatsappNumber}`,
      icon: Phone,
    },
    {
      label: content.contact.channels.github,
      value: `github.com/${SITE_LINKS.github.split("/").pop()}`,
      href: SITE_LINKS.github,
      icon: null,
      brandPath: siGithub.path,
    },
  ] as const;

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

      gsap.from("[data-contact-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      gsap.utils.toArray<HTMLElement>("[data-channel-card]").forEach((card) => {
        gsap.from(card, {
          // From the side the column starts on, which flips with the layout.
          x: () => (document.documentElement.dir === "rtl" ? 24 : -24),
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 92%" },
        });
      });

      // Form fields resolve one after another rather than as one flat block
      // — a lighter echo of the same row-by-row idea used elsewhere.
      gsap.from("[data-field-reveal]", {
        y: 16,
        opacity: 0,
        duration: 0.55,
        delay: 0.15,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    },
    { scope: sectionRef },
  );

  // A small confirmatory pop the moment the send status actually changes —
  // separate from the scroll-in reveal above, since this is state-driven,
  // not scroll-driven.
  useGSAP(
    () => {
      if (!statusRef.current || state.status === "idle") return;
      gsap.from(statusRef.current, {
        y: 8,
        opacity: 0,
        scale: 0.94,
        duration: 0.45,
        ease: "back.out(2.2)",
      });
    },
    { dependencies: [state.status], scope: sectionRef },
  );

  // Telegram: do nothing here and let the form's `action` (the Server
  // Action) run as normal. WhatsApp: prevent that Server Action from firing
  // at all — React respects `preventDefault` on the submit event — and open
  // the deep link ourselves instead, synchronously inside this trusted
  // event so browsers don't treat it as an unrequested popup.
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (channel !== "whatsapp") return;
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const text = `Hi Naya, I'm ${name} (${email}).\n\n${message}`;
    const waUrl = `https://wa.me/${SITE_LINKS.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section ref={sectionRef} id="contact" className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-baseline lg:gap-6 lg:text-start">
          <p
            data-contact-reveal
            className="shrink-0 font-mono text-xs tracking-[0.2em] text-muted uppercase"
          >
            {content.contact.eyebrow}
          </p>
          <h2
            data-contact-reveal
            data-theme-impact
            className="font-display text-2xl leading-[1.2] tracking-tight text-foreground sm:text-3xl"
          >
            {content.contact.headline}
          </h2>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <div className="flex flex-col gap-4">
            <p data-contact-reveal className="text-sm leading-relaxed text-muted">
              {content.contact.intro}
            </p>

            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                data-channel-card
                data-theme-impact
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer noopener" : undefined}
                onMouseMove={onSpotlightMove}
                className="group glass relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 transition-transform duration-300 ease-out hover:-translate-y-0.5"
                style={{
                  backgroundImage:
                    "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%)",
                }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                  {channel.icon ? (
                    <channel.icon className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                      <path d={channel.brandPath} />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                    {channel.label}
                  </span>
                  <span dir="ltr" className="block truncate text-sm text-foreground rtl:text-right">
                    {channel.value}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent"
                  strokeWidth={2.5}
                />
              </a>
            ))}

            <div data-contact-reveal className="mt-2 flex items-center gap-2">
              <a
                href={`https://t.me/${SITE_LINKS.telegramHandle}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={content.contact.telegramAria}
                className="glass flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                  <path d={siTelegram.path} />
                </svg>
              </a>
              <a
                href={`https://wa.me/${SITE_LINKS.whatsappNumber}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={content.contact.whatsappAria}
                className="glass flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                  <path d={siWhatsapp.path} />
                </svg>
              </a>
            </div>
          </div>

          <form
            action={formAction}
            onSubmit={onSubmit}
            onMouseMove={onSpotlightMove}
            data-contact-reveal
            className="glass relative overflow-hidden rounded-2xl p-6"
            style={{
              backgroundImage:
                "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--accent) 10%, transparent), transparent 70%)",
            }}
          >
            <div className="relative grid gap-4 sm:grid-cols-2">
              <label data-field-reveal className="flex flex-col gap-1.5 text-start">
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                  {content.contact.form.nameLabel}
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  className="rounded-xl border border-(--glass-border) bg-transparent px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_20%,transparent)]"
                  placeholder={content.contact.form.namePlaceholder}
                />
              </label>
              <label data-field-reveal className="flex flex-col gap-1.5 text-start">
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                  {content.contact.form.emailLabel}
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="rounded-xl border border-(--glass-border) bg-transparent px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_20%,transparent)]"
                  placeholder={content.contact.form.emailPlaceholder}
                />
              </label>
              <label data-field-reveal className="flex flex-col gap-1.5 text-start sm:col-span-2">
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                  {content.contact.form.messageLabel}
                </span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="resize-none rounded-xl border border-(--glass-border) bg-transparent px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_20%,transparent)]"
                  placeholder={content.contact.form.messagePlaceholder}
                />
              </label>
            </div>

            <div
              data-field-reveal
              role="group"
              aria-label={content.contact.form.channelLabel}
              className="relative mt-5 flex flex-wrap items-center gap-3"
            >
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                {content.contact.form.channelLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-pressed={channel === "telegram"}
                  onClick={() => setChannel("telegram")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 ${
                    channel === "telegram"
                      ? "bg-accent text-forest-ink"
                      : "border border-(--glass-border) text-muted hover:text-foreground"
                  }`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
                    <path d={siTelegram.path} />
                  </svg>
                  {content.contact.form.channelTelegram}
                </button>
                <button
                  type="button"
                  aria-pressed={channel === "whatsapp"}
                  onClick={() => setChannel("whatsapp")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 ${
                    channel === "whatsapp"
                      ? "bg-accent text-forest-ink"
                      : "border border-(--glass-border) text-muted hover:text-foreground"
                  }`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
                    <path d={siWhatsapp.path} />
                  </svg>
                  {content.contact.form.channelWhatsapp}
                </button>
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={channel === "telegram" && pending}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-forest-ink transition-transform duration-200 ease-out hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {channel === "telegram" && pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                ) : channel === "whatsapp" ? (
                  <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                    <path d={siWhatsapp.path} />
                  </svg>
                ) : (
                  <Send className="h-4 w-4" strokeWidth={2.5} />
                )}
                {channel === "whatsapp"
                  ? content.contact.form.sendWhatsapp
                  : pending
                    ? content.contact.form.sending
                    : content.contact.form.send}
              </button>

              {channel === "telegram" && state.status !== "idle" && state.messageKey && (
                <p
                  ref={statusRef}
                  role="status"
                  className={`text-[13px] ${state.status === "success" ? "text-accent" : "text-muted"}`}
                >
                  {content.contact.messages[state.messageKey]}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
