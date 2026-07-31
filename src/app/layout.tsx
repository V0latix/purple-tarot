import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Purple Tarot — Assistant des règles",
  description:
    "Consultez les règles de Purple Tarot et obtenez une réponse sourcée pendant la partie.",
  applicationName: "Purple Tarot Rules Assistant",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2a103e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
