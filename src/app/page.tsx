import Link from "next/link";
import {
  ChartNoAxesColumnIncreasing,
  Package,
  Share2,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";

const destinations = [
  { label: "CHARACTERS", href: "/characters", icon: Users },
  { label: "ITEMS", href: "/items", icon: Package },
  { label: "ABILITIES", href: "/abilities", icon: Sparkles },
  { label: "GRAPH VIEW", href: "/graph", icon: Share2 },
  { label: "STATISTICS", href: "/stats", icon: ChartNoAxesColumnIncreasing },
  { label: "TAGS", href: "/tags", icon: Tags },
];

export default function Home() {
  return (
    <div className="home-page min-h-screen">
      <div className="home-page__content container mx-auto px-4 py-16">
        <header className="home-page__header">
          <p className="home-page__eyebrow">ROLEPLAY ARCHIVE</p>
          <h1 className="home-page__title retro-glow">UTG CATALOG</h1>
          <p className="home-page__tagline">Your world. Your data.</p>
        </header>

        <nav className="destination-grid" aria-label="Catalog destinations">
          {destinations.map(({ label, href, icon: Icon }, index) => (
            <Link
              key={href}
              className="destination-button"
              href={href}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="destination-button__icon" aria-hidden="true">
                <Icon size={19} strokeWidth={2.5} />
              </span>
              <span>{label}</span>
              <span className="destination-button__arrow" aria-hidden="true">›</span>
            </Link>
          ))}
        </nav>

        <p className="home-page__footer">LOCAL-FIRST CATALOG · READY WHEN YOU ARE</p>
      </div>
    </div>
  );
}
