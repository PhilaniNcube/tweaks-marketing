"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Menu,
  ChevronDown,
  FileText,
  PenTool,
  Headphones,
  CheckSquare,
  Layout,
  List,
  Mail,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

const services = [
  {
    name: "Academic Editing",
    href: "/academic-editing",
    description: "Dissertation & thesis refinement",
    icon: GraduationCap,
  },
  {
    name: "Journal & Proposal Editing",
    href: "/journal-article-proposal-editing",
    description: "Prepare for high-impact publication",
    icon: BookOpen,
  },
  // { // temporarily disabled
  //   name: "Transcription Services",
  //   href: "/transcription",
  //   description: "Convert audio & video to precise text",
  //   icon: Headphones,
  // },
  {
    name: "Reference Checking",
    href: "/reference-checking",
    description: "Cross-check & verify citations",
    icon: CheckSquare,
  },
  {
    name: "Document Formatting",
    href: "/formatting",
    description: "APA, MLA, Harvard, Chicago styles",
    icon: Layout,
  },
  {
    name: "Reference List Editing",
    href: "/reference-list-editing",
    description: "Construct & fix bibliography entries",
    icon: List,
  },
  {
    name: "Abstract Editing",
    href: "/abstract-editing",
    description: "Perfect summary for maximum impact",
    icon: FileText,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/45 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight"
        >
          <Image
            src="/images/tweaks_logo.png"
            alt="Tweaks Academic Writing"
            width={100}
            height={100}
            className="w-16 object-cover"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
              pathname === "/"
                ? "text-indigo-600 font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-indigo-600 outline-none cursor-pointer">
              <span>Services</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[300px] p-2 grid gap-1"
            >
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <DropdownMenuItem
                    key={service.href}
                    asChild
                    className="cursor-pointer"
                  >
                    <Link
                      href={service.href}
                      className={`flex gap-3 items-start p-2 rounded-none transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 ${
                        pathname === service.href
                          ? "bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                          : ""
                      }`}
                    >
                      <div className="mt-0.5 rounded-none p-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm leading-none">
                          {service.name}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {service.description}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
              pathname === "/contact"
                ? "text-indigo-600 font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm"
          >
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" />
              Get a Quote
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-indigo-600 cursor-pointer"
                />
              }
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-left font-bold text-xl flex items-center gap-2">
                  <Image
                    src="/images/tweaks_logo.png"
                    alt="Tweaks Academic Writing"
                    width={100}
                    height={100}
                    className="w-16 object-cover"
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6 h-[calc(100vh-80px)] justify-between">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className={`text-base font-semibold px-2 py-1 rounded-none transition-colors ${
                      pathname === "/"
                        ? "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "text-foreground"
                    }`}
                  >
                    Home
                  </Link>
                  <div className="border-t border-border/50 my-1"></div>
                  <div className="px-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Services
                  </div>
                  <div className="grid gap-2 pl-2">
                    {services.map((service) => {
                      const Icon = service.icon;
                      return (
                        <Link
                          key={service.href}
                          href={service.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 text-sm py-2 px-2 rounded-none transition-colors hover:bg-muted ${
                            pathname === service.href
                              ? "text-indigo-600 font-semibold bg-indigo-50/30 dark:bg-indigo-950/10"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                          <span>{service.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-border/50 my-1"></div>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className={`text-base font-semibold px-2 py-1 rounded-none transition-colors ${
                      pathname === "/contact"
                        ? "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "text-foreground"
                    }`}
                  >
                    Contact
                  </Link>
                </div>
                <div className="grid gap-2">
                  <Button
                    asChild
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Get a Free Quote
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
