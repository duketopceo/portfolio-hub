/** Full site map — footer and sitemap. */
export const siteNavItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/openrouter", label: "OpenRouter" },
  { href: "/demos", label: "Demos" },
  { href: "/now", label: "Now" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/resume", label: "Resume" },
  { href: "/hire", label: "Hire" },
] as const;

/** Header rail — Contact lives on /hire and /contact; keep nav uncrowded. */
export const headerNavItems = siteNavItems.filter(
  (item) => item.href !== "/contact"
);
