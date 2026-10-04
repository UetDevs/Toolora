import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Toolora handles local processing, contact email, cookies and Google advertising.",
};

export default function PrivacyPage() {
  return (
    <Article title="Privacy Policy" updated="3 October 2026">
      <p>
        This is what Toolora ({site.url}) collects and what it does not. Most tools run on your
        device, so we never see the numbers or files you type in.
      </p>
      <h2>Information we do not collect in tools</h2>
      <p>
        Calculators, converters, image editors, writing helpers and most developer utilities run in your
        browser. We do not create an account for you and we do not store the numbers, drafts or files you
        type into those pages on a Toolora server.
      </p>
      <h2>Information you send on purpose</h2>
      <p>
        If you email {site.email} or use the contact page, we receive the name, address and message you
        include so we can reply. We keep that correspondence only as long as we need to handle the request.
      </p>
      <h2>Technical logs</h2>
      <p>
        The host that serves this website may record standard server logs such as IP address, browser type
        and the page requested. Those logs are used to keep the site online and to diagnose errors, not to
        build a marketing profile.
      </p>
      <h2>Cookies and advertising</h2>
      <p>
        Essential cookies or local storage may remember a simple preference such as cookie consent. If we
        enable Google AdSense, Google may use cookies or similar technology to show ads, limit how often
        you see an ad and measure whether ads were shown. Google’s use of data is described in{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          className="font-semibold text-brand"
          rel="noreferrer"
          target="_blank"
        >
          Google’s advertising policies
        </a>
        . You can opt out of personalized ads at{" "}
        <a
          href="https://adssettings.google.com"
          className="font-semibold text-brand"
          rel="noreferrer"
          target="_blank"
        >
          adssettings.google.com
        </a>
        .
      </p>
      <p>
        Details about cookie types live on the{" "}
        <Link href="/cookie-policy" className="font-semibold text-brand">
          Cookie Policy
        </Link>
        . Where the law requires a choice before non-essential cookies, we will show a banner.
      </p>
      <h2>Children</h2>
      <p>
        Toolora is a general-audience site. We do not knowingly collect personal information from children
        under 13. If you believe a child sent us personal details, write to {site.email} and we will delete
        them.
      </p>
      <h2>Your requests</h2>
      <p>
        You can ask what contact mail we hold, or ask us to delete it, by emailing {site.email}. Browser
        tool inputs are not in our database because they were never uploaded.
      </p>
      <h2>Changes</h2>
      <p>
        We will update this page when the site’s practices change and refresh the date at the top. Continued
        use after a change means you accept the revised policy.
      </p>
    </Article>
  );
}
