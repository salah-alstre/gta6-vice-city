import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import AssetPreloader from "@/components/system/AssetPreloader";
import { MODEL_URL } from "@/lib/modelConstants";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");

  return {
    metadataBase: new URL("https://gta6-vice-city.example.com"),
    title: {
      default: t("title"),
      template: `%s — ${t("title")}`,
    },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="en" dir="ltr" className={`${bebasNeue.variable} ${inter.variable} h-full`}>
      {/*
        A <link> rendered anywhere in the tree gets hoisted into <head> by
        Next.js's App Router — this is the standard way to add a resource
        hint here. `as="fetch"` + `crossOrigin="anonymous"` matches how
        GLTFLoader (via drei's useGLTF, itself using three-stdlib's
        FileLoader) actually requests the file, so the browser recognizes
        AssetPreloader's later fetch as the same request this hint already
        started, rather than issuing — and caching — a second one. Same
        MODEL_URL constant as AssetPreloader.tsx and PosterModel.tsx.
      */}
      <link
        rel="preload"
        href={MODEL_URL}
        as="fetch"
        type="model/gltf-binary"
        crossOrigin="anonymous"
      />
      <body className="min-h-full bg-void text-paper antialiased">
        <AssetPreloader />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
