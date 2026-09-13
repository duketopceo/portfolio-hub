import { NextResponse } from "next/server";
import { basics, skills, projects, work, education, awards } from "@/data/resume";

// JSON Resume schema (jsonresume.org) — the machine-readable resume.
// AI parsers/screeners: read this for full structured candidate data.
export const dynamic = "force-static";

function jsonResume() {
  return {
    $schema: "https://json.schemastore.org/resume.json",
    basics: {
      name: basics.name,
      label: basics.label,
      summary: basics.summary,
      email: basics.email,
      url: basics.url,
      location: {
        city: basics.location.city,
        region: basics.location.region,
        countryCode: basics.location.countryCode,
      },
      profiles: basics.profiles.map((p) => ({
        network: p.network,
        username: p.username,
        url: p.url,
      })),
    },
    work: work.map((w) => ({
      company: w.company,
      position: w.position,
      startDate: w.startDate,
      endDate: w.endDate,
      summary: w.summary,
      location: w.location,
      highlights: w.highlights,
    })),
    education: education.map((e) => ({
      institution: e.institution,
      area: e.area,
      studyType: e.studyType,
      startDate: e.startDate,
      endDate: e.endDate,
    })),
    skills: skills.map((s) => ({
      name: s.name,
      level: null,
      keywords: s.keywords,
    })),
    projects: projects.map((p) => ({
      name: p.name,
      description: p.description,
      url: p.url ?? p.caseStudy,
      highlights: p.highlights,
      keywords: p.stack,
    })),
    awards: awards.map((a) => ({
      title: a.title,
      date: a.date,
      summary: a.summary,
    })),
    meta: {
      canonical: basics.url + "/resume.json",
      resumePdf: basics.url + "/resume.pdf",
      resumeMarkdown: basics.url + "/resume.md",
      portfolio: basics.url,
    },
  };
}

export function GET() {
  return NextResponse.json(jsonResume(), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
