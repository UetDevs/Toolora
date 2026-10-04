import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookies and local storage used on Toolora, including Google AdSense if ads are enabled.",
};

export default function CookiePolicyPage() {
  return (
    <Article title="Cookie Policy" updated="3 October 2026">
      <p>
        Cookies and similar storage on {site.url}. Also see the{" "}
        <Link href="/privacy-policy" className="font-semibold text-brand">
          Privacy Policy
        </Link>
        .
      </p>
      <h2>Essential storage</h2>
      <p>
        We may save a small preference in your browser, such as whether you accepted or declined optional
        cookies. That storage is used only to remember the choice.
      </p>
      <h2>Advertising cookies</h2>
      <p>
        If Google AdSense is active, Google and its partners may set cookies to show ads, measure them and
        avoid repeating the same ad too often. Some ads may be personalized based on other sites you have
        visited. You can manage ad personalization at{" "}
        <a
          href="https://adssettings.google.com"
          className="font-semibold text-brand"
          rel="noreferrer"
          target="_blank"
        >
          Google Ad Settings
        </a>{" "}
        and read{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          className="font-semibold text-brand"
          rel="noreferrer"
          target="_blank"
        >
          how Google uses advertising cookies
        </a>
        .
      </p>
      <h2>How to control cookies</h2>
      <p>
        Every major browser lets you block or delete cookies. If you block all cookies, ads and some
        preferences may not work as expected. Tools themselves do not need an advertising cookie to
        calculate a result.
      </p>
      <h2>Questions</h2>
      <p>
        Email{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-brand">
          {site.email}
        </a>
        .
      </p>
    </Article>
  );
}
