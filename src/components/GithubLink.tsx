import { ExternalIcon } from "./Icons";

interface GithubLinkProps {
  url: string;
  label?: string;
}

export default function GithubLink({
  url,
  label = "View on GitHub",
}: GithubLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="cosmic-card-demo"
      data-umami-event="github-repo"
      data-umami-event-url={url}
    >
      <span className="cosmic-card-demo__left">{label}</span>
      <ExternalIcon className="w-4 h-4 opacity-70 shrink-0" aria-hidden />
    </a>
  );
}
