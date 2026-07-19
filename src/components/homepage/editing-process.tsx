"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { MessageSquareText, FileText, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const comments = [
  {
    id: "GR1",
    author: "Senior Editor",
    initials: "SE",
    time: "2 hours ago",
    text: "GRAMMAR — Subject-verb agreement: 'Africa' is a singular noun and requires a singular verb. This error recurs in multiple paragraphs throughout the document. Search for every verb following 'Africa' and confirm agreement before resubmission. Your supervisor will flag this pattern.",
  },
  {
    id: "ST2",
    author: "Senior Editor",
    initials: "SE",
    time: "2 hours ago",
    text: "STRUCTURE — 'Not only necessary but urgent' is a strong rhetorical claim made here without evidential grounding. Revised to 'urgently overdue', which carries the same force but is better supported once your findings are presented. Revisit this claim in your final edit after the results chapter is complete.",
  },
  {
    id: "ST3",
    author: "Senior Editor",
    initials: "SE",
    time: "1 hour ago",
    text: "STRUCTURE — This introduction opened with a passive construction ('has long been a site of') that buried the subject. Restructured to open with the active subject 'Africa's representation'. General principle: topic sentences should place the key subject in subject position, not in a prepositional phrase.",
  },
  {
    id: "RF4",
    author: "Senior Editor",
    initials: "SE",
    time: "1 hour ago",
    text: "REFERENCING — Double citation: you cite Mbembe (2001) parenthetically and then again by full name inline in the same sentence. Choose one form. APA style: first in-text mention = 'Mbembe (2001)'; subsequent mentions = 'Mbembe' without the year.",
  },
  {
    id: "WC5",
    author: "Senior Editor",
    initials: "SE",
    time: "45 mins ago",
    text: "WORD CHOICE — 'Effect' is a noun; the verb form is 'affect'. You need the verb here: 'they affect foreign investment decisions'. Search the full document for every instance of 'effect' and confirm whether it functions as noun or verb.",
  },
  {
    id: "WC6",
    author: "Senior Editor",
    initials: "SE",
    time: "30 mins ago",
    text: "WORD CHOICE — 'Practise' (British English verb) vs 'practice' (noun). South African academic English follows British conventions. You need the noun here: 'in practice'. Check every instance across the full document.",
  },
  {
    id: "ST7",
    author: "Senior Editor",
    initials: "SE",
    time: "15 mins ago",
    text: "STRUCTURE — Research questions are well-structured. However, 'it ask three questions' is both grammatically incorrect and too informal. Revised to 'asks three guiding questions', which also signals methodological intent. Also note: Question 3 ('accessible') is underspecified. Accessible to whom? Add your target audience.",
  },
];

type Mode = "original" | "simple" | "all";

function DocumentView({ mode }: { mode: Mode }) {
  const renderDel = (text: string) => {
    if (mode === "original") return text;
    if (mode === "simple") return null;
    return (
      <span className="line-through text-tweaks-red bg-red-50 dark:bg-red-950/30 px-0.5 rounded-sm decoration-tweaks-red">
        {text}
      </span>
    );
  };

  const renderIns = (text: string) => {
    if (mode === "original") return null;
    return (
      <span className="text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-0.5 rounded-sm underline decoration-emerald-500/50">
        {text}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div
        className={cn("flex-1", mode !== "original" ? "md:w-2/3" : "w-full")}
      >
        <div className="h-[650px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-none overflow-hidden flex flex-col">
          <div className="py-3 px-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row items-center gap-2">
            <FileText className="w-4 h-4 text-tweaks-blue" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Shifting_the_Narrative_v2.docx
            </span>
          </div>
          <div className="p-6 md:p-10 flex-1 overflow-auto">
            <div className="font-serif text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-bold text-xl mb-2">
                  Shifting the Narrative: Towards an Authentic Representation of
                  African Realities in Global Discourse
                </h2>
                <p className="italic text-slate-500 dark:text-zinc-400 text-sm">
                  A sample research paper for editorial illustration purposes
                </p>
              </div>

              <h3 className="font-bold text-lg mb-2">Abstract</h3>
              <p className="mb-4">
                For decades,{" "}
                {renderDel(
                  "dominant narratives about Africa has been shaped by external perspectives that prioritise ",
                )}
                {renderIns("external perspectives prioritising ")}deficit,
                conflict, and underdevelopment
                {renderIns(" have shaped representations of Africa")}. This
                paper {renderDel("argue ")}
                {renderIns("argues ")}that a deliberate shift in{" "}
                {renderDel("how Africa is represented in ")}
                {renderIns("the representation of Africa across ")}academic,
                media, and policy discourse is not only{" "}
                {renderDel("necessary but urgent")}
                {renderIns("necessary but urgently overdue")}. Drawing on
                postcolonial theory and Afrocentric scholarship,{" "}
                {renderDel("the study examines ")}
                {renderIns("this study examines ")}the mechanisms through which
                negative stereotypes are {renderDel("reproduce ")}
                {renderIns("reproduced ")}and {renderDel("propose ")}
                {renderIns("proposes ")}a framework for counter-narratives that
                centres African agency, innovation, and diversity. The findings
                suggest that authentic representation {renderDel("have ")}
                {renderIns("has ")}significant implications for continental
                development, international partnerships, and the self-perception
                of African {renderDel("youth's")}
                {renderIns("youth")}.
              </p>

              <h3 className="font-bold text-lg mb-2 mt-8">1. Introduction</h3>
              <p className="mb-4">
                {renderDel(
                  "The representation of Africa in global discourse has long been a site of contestation. Western media outlets, international organisations, and academic institutions have historically constructed Africa as ",
                )}
                {renderIns(
                  "Africa's representation in global discourse has long been contested. Western media outlets, international organisations, and academic institutions have historically constructed the continent as ",
                )}
                a continent defined by {renderDel("it's ")}
                {renderIns("its ")}problems rather than its possibilities (Wa
                Thiong&apos;o, 1986; Mbembe, 2001). These narratives, which{" "}
                {renderDel("Achille Mbembe (2001) describes ")}
                {renderIns("Mbembe describes ")}as the &ldquo;negative&rdquo;
                imaginary, have profound and lasting consequences: they{" "}
                {renderDel("effect ")}
                {renderIns("affect ")}foreign investment decisions, shape
                humanitarian interventions, and{" "}
                {renderDel("perhaps most damagingly, — ")}
                {renderIns("most significantly — ")}influence how young Africans
                see themselves and their futures.
              </p>

              <p className="mb-4">
                In recent years, scholars, journalists, and activists across the
                continent have {renderDel("began ")}
                {renderIns("begun ")}to challenge these representations.
                Initiatives such as the &ldquo;Africa is a Country&rdquo;
                platform, the growing body of Afrofuturist literature, and the
                increasing visibility of African voices in international forums
                all {renderDel("points ")}
                {renderIns("point ")}to a growing awareness that narrative
                change is inseparable from structural change.{" "}
                {renderDel(
                  "However, the academic literature on this subject remains fragmented, and there is a lack of consensus on ",
                )}
                {renderIns("Despite this momentum, scholarly consensus on ")}
                what a counter-narrative framework should{" "}
                {renderDel("actually ")}
                look like in {renderDel("practise.")}
                {renderIns("practice remains elusive.")}
              </p>

              <p className="mb-4">
                {renderDel(
                  "This paper seeks to address this gap. Specifically, it ",
                )}
                {renderIns("In doing so, it ")}
                {renderDel("ask ")}
                {renderIns("asks ")}three {renderDel("questions")}
                {renderIns("guiding questions")}: First, through what mechanisms
                are deficit narratives about Africa perpetuated? Second, what
                theoretical resources {renderDel("does ")}
                {renderIns("do ")}postcolonial and Afrocentric scholarship offer
                for constructing {renderDel("alternatives")}
                {renderIns("counter-narratives")}? Third, how can{" "}
                {renderDel("these alternatives ")}
                {renderIns("such counter-narratives ")}be operationalised in
                academic writing, policy documents, and public communication in
                a way that is both rigorous and {renderDel("accessible")}
                {renderIns("accessible to diverse audiences")}?
              </p>
            </div>
          </div>
        </div>
      </div>

      {mode !== "original" && (
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <MessageSquareText className="w-4 h-4 text-tweaks-blue" />
            Editor Comments
          </h3>
          <div className="h-[618px] overflow-y-auto pr-2">
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-none p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full border border-tweaks-blue/20 bg-tweaks-blue/10 flex items-center justify-center text-tweaks-blue text-xs font-medium">
                      {comment.initials}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {comment.author}
                        </span>
                        <span className="text-xs text-tweaks-blue bg-tweaks-blue/10 px-2 py-0.5 rounded-none font-mono font-bold tracking-tight">
                          {comment.id}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {comment.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed pl-11">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditingProcess() {
  const [activeTab, setActiveTab] = useState<Mode>("all");

  return (
    <section className="py-20 bg-slate-50 dark:bg-zinc-950 border-t border-b border-slate-100 dark:border-zinc-800/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tweaks-blue"
          >
            <CheckCheck className="h-4 w-4" />
            Transparent Editing Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            This is what our editing actually looks like
          </motion.h2>
          <div className="w-16 h-1 bg-tweaks-blue dark:bg-indigo-400 mx-auto rounded-none" />
          <p className="text-slate-600 dark:text-zinc-400 font-light text-base leading-relaxed">
            Tweaks uses tracked changes on every document. Toggle between the
            original, simple markup and full markup to see exactly how we work
            and why every change is made.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as Mode)}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3 p-1 bg-slate-100/80 dark:bg-zinc-900 rounded-none">
                <TabsTrigger
                  value="original"
                  className="rounded-none data-[state=active]:bg-tweaks-blue data-[state=active]:text-white data-[state=active]:shadow-none text-slate-600 dark:text-zinc-400"
                >
                  Original
                </TabsTrigger>
                <TabsTrigger
                  value="simple"
                  className="rounded-none data-[state=active]:bg-tweaks-blue data-[state=active]:text-white data-[state=active]:shadow-none text-slate-600 dark:text-zinc-400"
                >
                  Simple Markup
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-none data-[state=active]:bg-tweaks-blue data-[state=active]:text-white data-[state=active]:shadow-none text-slate-600 dark:text-zinc-400"
                >
                  All Markups
                </TabsTrigger>
              </TabsList>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <TabsContent
                value="original"
                className="m-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <DocumentView mode="original" />
              </TabsContent>
              <TabsContent
                value="all"
                className="m-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <DocumentView mode="all" />
              </TabsContent>
              <TabsContent
                value="simple"
                className="m-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <DocumentView mode="simple" />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
