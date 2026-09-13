import { basics, skills, projects, work, education, awards } from "@/data/resume";

// Plain-markdown resume — easiest single-file ingestion for LLMs/AI screeners.
export const dynamic = "force-static";

function md() {
  const L: string[] = [];
  L.push(`# ${basics.name} — ${basics.label}`, "");
  L.push(`*${basics.headline}*`, "");
  L.push(
    `${basics.email} · ${basics.location.city}, ${basics.location.region} (Remote, US)`,
  );
  L.push("");
  L.push(`- LinkedIn: ${basics.profiles[0].url}`);
  L.push(`- GitHub: ${basics.profiles[1].url}`);
  L.push(`- Portfolio: ${basics.profiles[2].url}`);
  L.push("");

  L.push("## Profile", "");
  L.push(basics.summary, "");

  L.push("## Core Capabilities", "");
  for (const s of skills) {
    L.push(`- **${s.name}** — ${s.detail}`);
  }
  L.push("");

  L.push("## Selected Projects", "");
  for (const p of projects) {
    L.push(`### ${p.name}`, "");
    const link = p.url ?? p.caseStudy;
    if (link) L.push(`Link: ${link}`, "");
    L.push(p.description, "");
    for (const h of p.highlights) L.push(`- ${h}`);
    if (p.stack.length) L.push("", `Stack: ${p.stack.join(", ")}.`);
    L.push("");
  }

  L.push("## Experience", "");
  for (const w0 of work) {
    L.push(`### ${w0.position} — ${w0.company}`, "");
    L.push(`${w0.startDate}–${w0.endDate} · ${w0.location}`, "");
    L.push(w0.summary, "");
    for (const h of w0.highlights) L.push(`- ${h}`);
    L.push("");
  }

  L.push("## Education", "");
  for (const e of education) {
    L.push(`- **${e.studyType}, ${e.area}** — ${e.institution} (${e.startDate}–${e.endDate})`);
  }
  L.push("");

  if (awards.length) {
    L.push("## Awards", "");
    for (const a of awards) L.push(`- **${a.title}** (${a.date}) — ${a.summary}`);
    L.push("");
  }

  L.push("---", "");
  L.push(
    `Machine-readable: [JSON Resume](${basics.url}/resume.json) · [PDF](${basics.url}/resume.pdf) · [llms.txt](${basics.url}/llms.txt)`,
  );
  return L.join("\n");
}

export function GET() {
  return new Response(md(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
