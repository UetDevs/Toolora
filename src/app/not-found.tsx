import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">This tool was not found</h1>
      <p className="mt-3 text-muted">The page may have moved. Browse the toolbox instead.</p>
      <Link href="/tools" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
        Browse tools
      </Link>
    </div>
  );
}
