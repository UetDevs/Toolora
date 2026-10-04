"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-footer text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">{site.tagline}</p>
          <p className="mt-3 text-sm">
            <a href={`mailto:${site.email}`} className="text-slate-300 hover:text-white">
              {site.email}
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/tools" className="hover:text-white">Tools</Link></li>
            <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Legal</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link href="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Good to know</h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Most tools run in your tab. Writing helpers are for your own drafts. We do not grab videos
            from social sites.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Toolora. All rights reserved.</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
