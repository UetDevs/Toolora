"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { categories } from "@/lib/categories";
import { searchTools } from "@/lib/tools";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools", hasMenu: true },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openTools, setOpenTools] = useState(false);

  const results = useMemo(() => (query.trim() ? searchTools(query).slice(0, 6) : []), [query]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex">
          {links.map((link) =>
            link.hasMenu ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setOpenTools(true)}
                onMouseLeave={() => setOpenTools(false)}
              >
                <Link href={link.href} className="inline-flex items-center gap-1 hover:text-ink">
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                {openTools ? (
                  <div className="absolute left-0 top-full z-20 w-72 rounded-2xl border border-line bg-white p-2 shadow-card-hover">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={category.href}
                        className="block rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-slate-50 hover:text-ink"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setOpenSearch(true)}
              placeholder="Search tools..."
              className="h-10 w-56 rounded-full border border-line bg-slate-50 pl-9 pr-4 text-sm outline-none ring-brand/20 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 lg:w-64"
            />
            {openSearch && query.trim() ? (
              <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-line bg-white p-2 shadow-card-hover">
                {results.length ? (
                  results.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={tool.href}
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => {
                        setQuery("");
                        setOpenSearch(false);
                      }}
                    >
                      <span className="font-medium text-ink">{tool.name}</span>
                      <span className="mt-0.5 block text-xs text-subtle">{tool.description}</span>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-subtle">No tools found.</p>
                )}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted lg:hidden"
            onClick={() => setOpenMenu((value) => !value)}
            aria-label="Open menu"
          >
            {openMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {openMenu ? (
        <div className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools..."
              className="h-11 w-full rounded-full border border-line bg-slate-50 pl-9 pr-4 text-sm outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-muted hover:bg-slate-50 hover:text-ink"
                onClick={() => setOpenMenu(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {query.trim() ? (
            <div className="mt-3 space-y-1">
              {results.map((tool) => (
                <Link
                  key={tool.slug}
                  href={tool.href}
                  className={cn("block rounded-xl px-3 py-2 text-sm hover:bg-slate-50")}
                  onClick={() => setOpenMenu(false)}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
