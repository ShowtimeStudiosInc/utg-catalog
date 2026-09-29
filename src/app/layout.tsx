import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppNavigation } from "@/components/app-navigation";
import { ScrollGridBackground } from "@/components/scroll-grid-background";

export const metadata: Metadata = {
  title: "Cataloger | RP Archive",
  description: "Visual note-taking application for roleplay server management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ScrollGridBackground />
        <Providers>
          <a className="skip-to-content" href="#main-content">
            Skip to content
          </a>
          <AppNavigation />
          <main id="main-content" tabIndex={-1}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}