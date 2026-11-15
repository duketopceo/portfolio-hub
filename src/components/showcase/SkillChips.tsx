/** Technologies and skills a project demonstrates; renders nothing when none are listed. */
export default function SkillChips({ skills }: { skills?: readonly string[] }) {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="showcase-skills">
      <h3 className="showcase-skills__label">Skills shown</h3>
      <ul className="showcase-skills__list">
        {skills.map((s) => (
          <li key={s} className="showcase-skills__chip">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
