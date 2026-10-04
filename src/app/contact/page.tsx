import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Email ${site.email} for Toolora feedback, tool requests or privacy questions.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Contact</h1>
      <p className="mt-3 leading-7 text-muted">
        For feedback, a tool request, a correction or a privacy question, email{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-brand">
          {site.email}
        </a>
        . We read every message. We cannot give medical, legal or financial advice.
      </p>
      <ContactForm />
    </div>
  );
}
