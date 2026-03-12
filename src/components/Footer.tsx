import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-auto py-6"
      style={{ borderTop: "1px solid var(--color-divider)" }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <div
          className="flex items-center justify-between"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
          }}
        >
          <span>Built with Next.js</span>
          <span>Deployed on Docker Swarm</span>
        </div>
      </div>
    </footer>
  );
}
