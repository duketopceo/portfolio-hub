/**
 * Builds the Portfolio Guide corpus manifest from the site's public evidence:
 * every catalog project becomes a `public-source` entry scoped to its dossier,
 * and the résumé sections become entries scoped to `resume:*`.
 *
 * `curated-private` entries are never generated here — they are separately
 * authored packages placed under src/lib/guide/curated-private/ and merged in
 * by the manifest, so private-project evidence only enters the corpus through
 * an explicit, human-approved file.
 */
import { projectConfigs } from "@/data/projects";
import { basics, skills, work, education, awards } from "@/data/resume";
import type { CorpusEntry } from "./corpus-manifest";

const SITE = "https://luke-the-duke.com";

function projectEntry(p: (typeof projectConfigs)[number]): CorpusEntry {
  const parts = [
    `${p.displayName} — ${p.tagline}`,
    p.description,
    p.highlights?.length
      ? `Highlights: ${p.highlights.join("; ")}`
      : "",
    p.architecture ? `Architecture: ${p.architecture}` : "",
    p.businessContext ? `Context: ${p.businessContext}` : "",
    p.scopeAndScale ? `Scope: ${p.scopeAndScale}` : "",
    p.private
      ? "This project's source is private; only this curated summary is public evidence."
      : "Public repository.",
  ];
  return {
    sourceId: `project-${p.slug}`,
    scope: p.slug,
    corpusClass: "public-source",
    title: `${p.displayName} — project dossier`,
    url: `${SITE}/projects/${p.slug}`,
    text: parts.filter(Boolean).join("\n"),
    provenance: `src/data/projects.ts entry "${p.slug}" (repo: ${p.repoName})`,
  };
}

function resumeEntries(): CorpusEntry[] {
  const entries: CorpusEntry[] = [
    {
      sourceId: "resume-summary",
      scope: "resume:summary",
      corpusClass: "public-source",
      title: "Résumé — summary",
      url: `${SITE}/resume`,
      text: `${basics.name} — ${basics.label}. ${basics.headline}\n${basics.summary}\nLocation: ${basics.location.city}, ${basics.location.region} (remote: ${basics.location.remote})`,
      provenance: "src/data/resume.ts basics",
    },
    ...skills.map(
      (s, i): CorpusEntry => ({
        sourceId: `resume-skill-${i + 1}`,
        scope: "resume:skills",
        corpusClass: "public-source",
        title: `Résumé — skill: ${s.name}`,
        url: `${SITE}/resume`,
        text: `${s.name}: ${s.detail}\nKeywords: ${s.keywords.join(", ")}`,
        provenance: `src/data/resume.ts skills[${i}]`,
      }),
    ),
    ...work.map(
      (w): CorpusEntry => ({
        sourceId: `resume-work-${w.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        scope: "resume:work",
        corpusClass: "public-source",
        title: `Résumé — ${w.position}, ${w.company}`,
        url: `${SITE}/resume`,
        text: `${w.position} at ${w.company} (${w.startDate}–${w.endDate}, ${w.location}). ${w.summary}\n${w.highlights.join("\n")}`,
        provenance: `src/data/resume.ts work entry "${w.company}"`,
      }),
    ),
    ...education.map(
      (e): CorpusEntry => ({
        sourceId: `resume-edu-${e.institution.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        scope: "resume:education",
        corpusClass: "public-source",
        title: `Résumé — ${e.institution}`,
        url: `${SITE}/resume`,
        text: `${e.studyType} in ${e.area}, ${e.institution} (${e.startDate}–${e.endDate})`,
        provenance: `src/data/resume.ts education entry "${e.institution}"`,
      }),
    ),
    ...awards.map(
      (a): CorpusEntry => ({
        sourceId: `resume-award-${a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        scope: "resume:awards",
        corpusClass: "public-source",
        title: `Résumé — ${a.title}`,
        url: `${SITE}/resume`,
        text: `${a.title} (${a.date}). ${a.summary}`,
        provenance: `src/data/resume.ts award "${a.title}"`,
      }),
    ),
  ];
  return entries;
}

/** The full approved corpus manifest — public evidence only. */
export function buildCorpusManifest(): CorpusEntry[] {
  return [...projectConfigs.map(projectEntry), ...resumeEntries()];
}
