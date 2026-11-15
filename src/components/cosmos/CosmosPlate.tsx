/**
 * Server-rendered static background: the starfield as a pre-rendered SVG still
 * (wide and tall variants, switched by container aspect ratio in CSS). Visible
 * by default; SiteBackground hides it only while the live scene is rendering.
 * Nothing animates.
 */
export default function CosmosPlate() {
  return (
    <div className="cosmos-plate" aria-hidden="true">
      <div className="cosmos-stars-still" />
    </div>
  );
}
