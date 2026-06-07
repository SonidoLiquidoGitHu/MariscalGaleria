import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Galería Mariscal — Joyería de Autor, Plata 925, Zacatecas México",
  description: "Galería Mariscal — Joyería de autor, plata 925, Zacatecas México. Galería elegante de joyería en plata 925 con publicaciones automáticas, generación de contenido con IA y gestión de redes sociales para Instagram y Facebook.",
  keywords: ["plata 925", "joyería de autor", "Zacatecas", "México", "galería de joyería", "redes sociales", "publicación automática", "Instagram", "Facebook"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
