import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import Image from "next/image";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const footerServices = [
  { name: "Academic Editing", href: "/academic-editing" },
  { name: "Journal & Proposal Editing", href: "/journal-article-proposal-editing" },
  { name: "Transcription Services", href: "/transcription" },
  { name: "Reference Checking", href: "/reference-checking" },
  { name: "Document Formatting", href: "/formatting" },
  { name: "Reference List Editing", href: "/reference-list-editing" },
  { name: "Abstract Editing", href: "/abstract-editing" },
];

const companyLinks = [

  { name: "Contact", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-200 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
              <Image
                src="/images/tweaks_logo.png"
                width={128}
                height={128}
                alt="TweaksAcademic"
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              Premium editorial solutions designed for researchers, graduate students, and academic institutions worldwide. Elevate your research.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                <LinkedinIcon className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                <GithubIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2">
              {footerServices.map((service) => (
                <li key={service.href}>
                  <Link href={service.href} className="text-sm text-slate-400 hover:text-white hover:underline transition-all">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white hover:underline transition-all">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-3">

              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>chengetai@conceptafrika.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TweakAcademic. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
