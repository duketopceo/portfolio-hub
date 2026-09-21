"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function WelcomeIntro() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [gone, setGone] = useState(true);

  // Every timer is tracked so a manual dismiss cancels the pending show and
  // auto-dismiss instead of racing them, and so nothing fires after unmount.
  const showRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (showRef.current) clearTimeout(showRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    if (exitRef.current) clearTimeout(exitRef.current);
    showRef.current = hideRef.current = exitRef.current = null;
  }, []);

  // Declared before the effect that schedules it, and stable across renders,
  // so the effect can depend on it honestly instead of suppressing the rule.
  const dismiss = useCallback(() => {
    clearTimers();
    setVisible(false);
    exitRef.current = setTimeout(() => setGone(true), 440);
    try { localStorage.setItem("lk_welcomed", "1"); } catch {}
  }, [clearTimers]);

  /* eslint-disable react-hooks/set-state-in-effect --
     This effect is inherently effect-time: the overlay renders nothing on the
     server and may only read localStorage on the client, so the mount gate and
     the welcome check both set state here. Rewriting it to the
     useSyncExternalStore hydration idiom is follow-up work, not a lint pass. */
  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem("lk_welcomed")) return;
    } catch {}
    setGone(false);
    showRef.current = setTimeout(() => setVisible(true), 900);
    hideRef.current = setTimeout(() => dismiss(), 18000);
    return clearTimers;
  }, [dismiss, clearTimers]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (
    !mounted ||
    gone ||
    pathname?.startsWith("/podcast") ||
    pathname?.startsWith("/openrouter")
  ) {
    return null;
  }

  return (
    <div
      className={`welcome-intro${visible ? " welcome-intro--visible" : ""}`}
      role="complementary"
      aria-label="Site introduction"
    >
      <button
        className="welcome-intro__close"
        onClick={dismiss}
        aria-label="Dismiss introduction"
        data-umami-event="intro-dismiss"
      >
        ×
      </button>

      <p className="welcome-intro__eyebrow">CI — Field registry</p>
      <p className="welcome-intro__headline">Systems that compound.</p>
      <p className="welcome-intro__body">
        AI infrastructure, trading tech &amp; open-source — surveyed as an
        orbital registry. Read the chart, or jump to a section.
      </p>

      <div className="welcome-intro__nav">
        <Link href="/" className="welcome-intro__chip" onClick={dismiss} data-umami-event="intro-choice" data-umami-event-target="chart">
          Chart ↺
        </Link>
        <Link href="/projects" className="welcome-intro__chip" onClick={dismiss} data-umami-event="intro-choice" data-umami-event-target="registry">
          Registry →
        </Link>
        <Link href="/now" className="welcome-intro__chip" onClick={dismiss} data-umami-event="intro-choice" data-umami-event-target="transmissions">
          Transmissions →
        </Link>
        <Link href="/about" className="welcome-intro__chip" onClick={dismiss} data-umami-event="intro-choice" data-umami-event-target="about">
          About →
        </Link>
        <Link href="/contact" className="welcome-intro__chip" onClick={dismiss} data-umami-event="intro-choice" data-umami-event-target="contact">
          Contact →
        </Link>
        <Link href="/hire" className="welcome-intro__chip" onClick={dismiss} data-umami-event="intro-choice" data-umami-event-target="hire">
          Hire →
        </Link>
        <Link
          href="/podcast"
          className="welcome-intro__chip welcome-intro__chip--accent"
          onClick={dismiss}
          data-umami-event="intro-choice"
          data-umami-event-target="podcast"
        >
          🎙 EP009
        </Link>
      </div>

      <button className="welcome-intro__cta" onClick={dismiss} data-umami-event="intro-dismiss">
        Got it
      </button>
    </div>
  );
}
