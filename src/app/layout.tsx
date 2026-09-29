import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppNavigation } from "@/components/app-navigation";

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
        <Providers>
          <AppNavigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}