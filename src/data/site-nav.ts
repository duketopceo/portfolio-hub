/** Full site map — footer and sitemap. */
export const siteNavItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/resume", label: "Resume" },
  { href: "/about", label: "About" },
  { href: "/hire", label: "Hire" },
] as const;

/** Header rail — four links; GitHub is an icon at the right. */
export const headerNavItems = siteNavItems.filter(
  (item) => item.href !== "/"
);

export const GITHUB_URL = "https://github.com/duketopceo";
export const SHOW_URL = "https://show.luke-the-duke.com";
