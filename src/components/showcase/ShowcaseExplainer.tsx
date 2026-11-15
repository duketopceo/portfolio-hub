import type { ReactNode } from "react";
import type { EnrichedProject } from "@/lib/types";
import { cardOf, isShowcaseEligible } from "@/lib/showcase";
import ShowcaseMedia from "./ShowcaseMedia";
import SkillChips from "./SkillChips";
import RoadmapTimeline from "./RoadmapTimeline";

/**
 * Dossier explanation: the loop (or its poster) floats beside the description
 * so the words wrap around it on a wide screen, and stacks above it on a phone.
 * Skills chips and the roadmap follow when the catalog has them. Excluded
 * entries render the plain description only.
 */
export default function ShowcaseExplainer({
  project,
  accentColor,
  children,
}: {
  project: EnrichedProject;
  accentColor: string;
  /** The description copy; defaults to the project description. */
  children?: ReactNode;
}) {
  const body = children ?? <p className="cosmic-readable">{project.description}</p>;
  if (!isShowcaseEligible(project.slug)) return <>{body}</>;
  const card = cardOf(project);
  return (
    <div className="showcase-explain" data-tier={card?.tier ?? "none"}>
      <div className="showcase-explain__flow">
        <figure className="showcase-explain__figure">
          <ShowcaseMedia
            slug={project.slug}
            name={project.displayName}
            capability={project.capability}
            accent={accentColor}
            card={card}
            mode="auto"
          />
          {card?.gif && <figcaption className="showcase-explain__caption">{card.gif.alt}</figcaption>}
        </figure>
        <div className="showcase-explain__text">{body}</div>
      </div>
      <SkillChips skills={card?.skills} />
      <RoadmapTimeline roadmap={card?.roadmap} />
    </div>
  );
}
