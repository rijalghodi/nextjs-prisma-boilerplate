import { env } from "./env.config";

export const siteConfig = {
  name: "Rumah Sakit Islam Metro Lampung",
  url: "https://qlaris.vercel.app",
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png`,
  tagline: "Accounting for RSI Metro",
  author: "Rumah Sakit Islam Metro Lampung",
  authorUrl: `${env.NEXT_PUBLIC_APP_URL}`,
  description: "Accounting for RSI Metro",
  keywords: ["Accounting", "RSI Metro", "RSI", "Metro", "Lampung"],
  links: {
    twitter: "https://twitter.com/rijalghodi.dev",
    github: "https://github.com/rijalghodi/qlaris",
    email: "mailto:rijalghodi.dev@gmail.com",
  },
};

export type SiteConfig = typeof siteConfig;
