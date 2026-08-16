"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function WelcomeIntro() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [gone, setGone] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem("lk_welcomed")) return;
    } catch {}
    setGone(false);
    const show = setTimeout(() => setVisible(true), 900);
    const hide = setTimeout(() => dismiss(), 18000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(() => setGone(true), 440);
    try { localStorage.setItem("lk_welcomed", "1"); } catch {}
  }

  if (!mounted || gone || pathname?.startsWith("/podcast")) return null;

  return (
    <div
      className={`welcome-intro${visible ? " welcome-intro--visible" : ""}`}
      role="complementary"
      aria-label="Site introduction"
    >
      <button className="welcome-intro__close" onClick={dismiss} aria-label="Dismiss introduction">
        ×
      </button>

      <p className="welcome-intro__eyebrow">Luke Kimball</p>
      <p className="welcome-intro__headline">Systems that compound.</p>
      <p className="welcome-intro__body">
        AI infrastructure, trading tech &amp; open-source. Orbit the projects
        below, or navigate the sections.
      </p>

      <div className="welcome-intro__nav">
        <Link href="/" className="welcome-intro__chip" onClick={dismiss}>
          Orbit ↺
        </Link>
        <Link href="/projects" className="welcome-intro__chip" onClick={dismiss}>
          Catalog →
        </Link>
        <Link href="/now" className="welcome-intro__chip" onClick={dismiss}>
          Activity →
        </Link>
        <Link href="/about" className="welcome-intro__chip" onClick={dismiss}>
          About →
        </Link>
        <Link href="/contact" className="welcome-intro__chip" onClick={dismiss}>
          Contact →
        </Link>
        <Link href="/hire" className="welcome-intro__chip" onClick={dismiss}>
          Hire →
        </Link>
        <Link
          href="/podcast"
          className="welcome-intro__chip welcome-intro__chip--accent"
          onClick={dismiss}
        >
          🎙 EP009
        </Link>
      </div>

      <button className="welcome-intro__cta" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
