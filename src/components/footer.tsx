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

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const footerServices = [
  { name: "Academic Editing", href: "/academic-editing" },
  { name: "Journal & Proposal Editing", href: "/journal-article-proposal-editing" },
  // { name: "Transcription Services", href: "/transcription" }, // temporarily disabled
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
              <Link href="https://www.linkedin.com/company/12955567" className="text-slate-400 hover:text-indigo-400 transition-colors">
                <LinkedinIcon className="h-4 w-4" />
              </Link>
              <Link href="https://www.instagram.com/tweaks_editing?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="text-slate-400 hover:text-indigo-400 transition-colors">
                <InstagramIcon className="h-4 w-4" />
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
                <span>hello@tweaks.co.za</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <Link href="https://www.conceptafrika.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">© {new Date().getFullYear()} designed with ❤️ by Concept Afrika</Link>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
