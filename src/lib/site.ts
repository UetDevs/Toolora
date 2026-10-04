export const site = {
  name: "Toolora",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolora.app",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@toolora.app",
  tagline: "Small web tools. No signup.",
  description:
    "Free calculators, converters, image tools and code utilities. Most of them run on your computer, not on our servers.",
};

export const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
export const adsenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "";
export const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";
