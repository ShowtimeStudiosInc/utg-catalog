"use client";

import Image from "next/image";
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
        <button
          className="app-navigation__back"
          onClick={goBack}
          type="button"
          aria-label="Go back to the previous page"
        >
          ← Back
        </button>
      )}
      <Link className="app-navigation__brand" href="/" aria-label="UTG Catalog home">
        <Image
          className="app-navigation__logo"
          src="/images/utg-logo.png"
          alt=""
          aria-hidden="true"
          width={125}
          height={125}
        />
        <span>UTG CATALOG</span>
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
