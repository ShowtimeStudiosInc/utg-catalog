"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const sections = [
  ["Home", "/"],
  ["Characters", "/characters"],
  ["Items", "/items"],
  ["Abilities", "/abilities"],
  ["Graph", "/graph"],
  ["Stats", "/stats"],
  ["Tags", "/tags"],
] as const;

export function AppNavigation() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const isHome = pathname === "/";

  function goBack() {
    const hasSameOriginReferrer = (() => {
      try {
        return Boolean(
          document.referrer &&
            new URL(document.referrer).origin === window.location.origin &&
            window.history.length > 1,
        );
      } catch {
        return false;
      }
    })();

    if (hasSameOriginReferrer) router.back();
    else router.push("/");
  }

  return (
    <header className="app-navigation">
      {!isHome && (
        <button className="app-navigation__back" onClick={goBack} type="button">
          ← Back
        </button>
      )}
      <Link className="app-navigation__brand" href="/" aria-label="Cataloger home">
        CATALOGER
      </Link>
      <nav className="app-navigation__links" aria-label="Main navigation">
        {sections.map(([label, href]) => (
          <Link
            key={href}
            className="app-navigation__link"
            href={href}
            aria-current={
              pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
                ? "page"
                : undefined
            }
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
