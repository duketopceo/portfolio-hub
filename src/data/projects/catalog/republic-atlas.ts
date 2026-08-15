import { defineProject } from "../define";

export const republicAtlasProject = defineProject({
  slug: "republic-atlas",
  repoName: "republic-atlas",
  displayName: "Republic Atlas",
  tagline:
    "Civic data intelligence — election visualization, voter tools, and political transparency",
  description:
    "A civic technology platform that turns election, demographic, and political data into interactive maps and voter tools. The repository is archived as a completed showcase while the externally hosted product remains available.",
  category: "osint",
  type: "platform",
  techStack: ["Python", "React", "Firebase", "GIS", "Data Visualization"],
  status: "showcase",
  private: true,
  liveUrl: "https://republicatlas.com",
  demoUrl: "https://republicatlas.com",
  embeddable: false,
  highlights: [
    "Interactive election and civic-data mapping",
    "Voter tools and political transparency workflows",
    "Python data processing with a React/Firebase product surface",
    "Completed repository with a retained external deployment",
  ],
  architecture:
    "Public data sources → Python processing → Firebase data layer → React + GIS visualization → Voter tools",
  engineeringDecisions: [
    "Map-first exploration — Makes geographic election patterns legible before users inspect tables",
    "Static hosting plus managed data services — Keeps the public civic surface inexpensive to operate",
  ],
});
