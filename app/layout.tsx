import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humanizador App",
  description:
    "App privado para humanizar textos com base em perfis comportamentais, canal e controles editoriais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
