"use client";

import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Reveal from "@/components/reveal";

const faqData = [
  {
    category: "Our Services",
    items: [
      {
        id: "s1",
        question: "Who edits my document? What training do they have?",
        answer:
          "Tweaks editors are all at least Masters graduates with subject-matter expertise and have a minimum of five years of experience in research and academic editing. Our editors and writers go through the Tweaks Deep Editor Training (DET) program. All our editors also receive intensive training on how to handle content by second-language English speakers and keep up to date on grammar, punctuation, and style for American and British English.",
      },
      {
        id: "s2",
        question: "Will the editor change everything?",
        answer:
          "Training in deep editing enables the editor to develop a sophisticated understanding of any material, ensuring that they do not unintentionally alter the author’s voice or meaning, or overlook errors that might not be apparent. All editing is tracked in Microsoft Word. Track Changes is a built-in feature in Microsoft Word which allows you to see the changes that were made to the document.",
      },
      {
        id: "s3",
        question: "Will I get an editing certificate?",
        answer:
          "Yes, you will. An editing certificate is emailed to you upon completion of editing.",
      },
    ],
  },
  {
    category: "Prices & Payments",
    items: [
      {
        id: "p1",
        question:
          "Your prices appear to be more expensive than those of another website I have found. Why should I use you?",
        answer:
          "Our service may appear more expensive; however, choosing the highest-quality and most professional service available ensures that you get the job done right the first time, saving you time and money in the long run. Choosing Tweaks Academic Editing Services ensures that your final document will be as polished and sophisticated as possible, giving you the best chance of publication or thesis acceptance. We are confident that our service is of exceptional value for money. Further, by paying our editors at a higher rate, we are able to attract and retain the most qualified and experienced academic editors in the business, guaranteeing that our clients receive high-quality work.",
      },
      {
        id: "p2",
        question: "What payment methods do you accept?",
        answer:
          "You can purchase any of our academic editing services online using a credit or debit card.",
      },
    ],
  },
  {
    category: "Guarantees",
    items: [
      {
        id: "g1",
        question:
          "What happens if I am not happy with the quality of the academic edit?",
        answer:
          "We guarantee the quality of our work. This means that, in the extremely rare instance that a client finds fault with our work, we will take immediate action to fix the problem. In the unlikely event that you find errors in our work, please contact us and we will correct them for you immediately and FREE of charge.",
      },
      {
        id: "g2",
        question:
          "What happens if I make changes to my edited document? Will you check it again for free?",
        answer:
          "If you make any changes or additions to your edited document and would like us to edit those changes and additions, we need to charge for that as new work. If you only want some clarification about our edits, or if you have found some errors in our work that require revision, we can do this FREE of charge, provided this is within the scope of the original job. This work is covered under our Quality Guarantee.",
      },
    ],
  },
  {
    category: "Referencing",
    items: [
      {
        id: "r1",
        question:
          "Will you crosscheck my in-text references, footnotes or endnotes and reference list or bibliography?",
        answer:
          "Yes. If you require us to edit your reference list or bibliography, we will crosscheck your reference list or bibliography with your in-text citations, footnotes or endnotes to ensure that each citation corresponds to a referenced source, and vice versa. We will edit your references to ensure that they are correct, consistent and complete, including locating and including missing source information where possible.",
      },
      {
        id: "r2",
        question:
          "Can you follow the guidelines from my university or journal regarding referencing?",
        answer:
          "Yes, definitely. We can follow any guidelines or style guide that you require. All our editors have a thorough knowledge of different referencing styles, enabling them to follow any required style accurately.",
      },
    ],
  },
  {
    category: "Formatting",
    items: [
      {
        id: "f1",
        question: "Can you format my document?",
        answer:
          "Yes. We provide publication-ready formatting services. Our exceptional attention to detail in academic editing also applies to the appearance of your document, which ensures that your research is presented in the best possible light, follows all required formatting guidelines and is ready for submission or publication. We offer flexible formatting options: we can apply a specific style (e.g. APA), check your current style for consistency, or apply our custom house style designed for academic documents.",
      },
      {
        id: "f2",
        question:
          "Can you follow the guidelines from my university or journal regarding formatting?",
        answer:
          "Yes, definitely. We can follow any guidelines or style guide that you require. All our editors have a thorough knowledge of different formatting styles, enabling them to follow any required style accurately.",
      },
    ],
  },
  {
    category: "Academic Integrity",
    items: [
      {
        id: "i1",
        question: "What guidelines do you follow in your editing?",
        answer:
          "As professional editors, we strictly adhere to all relevant guidelines, including The South African Guild of Editors (SAGE), Professional Editors’ Guild (PEG), South African National Editors' Forum (SANEF) and The Southern African Freelancers' Association (SAFREA). Where a client has been asked to follow any university-, journal- or publisher-specific guidelines, we will closely read and follow those as well.",
      },
      {
        id: "i2",
        question: "Can you write my essay for me?",
        answer:
          "NO! University academic integrity and plagiarism policies strictly prohibit students from having anyone else perform their work for them. We can certainly help you by editing your work and providing specific feedback to you on how you can further improve your academic writing skills.",
      },
    ],
  },
  {
    category: "Still in Doubt?",
    items: [
      {
        id: "d1",
        question:
          "I don't think I need editing. My thesis is very well written already.",
        answer:
          "Universities require that postgraduate theses meet international publication standards and this can only be achieved through professional editing, regardless of the quality of your writing. Clients who are exceptional academic writers are often surprised at just how much their thesis is improved by Tweak’s editing service. After researching and writing such a long document over many years, you can easily become blind to errors, inconsistencies and areas of potential improvement in your own work. A new set of eyes, especially those of a highly experienced professional, can catch all these issues for you.",
      },
      {
        id: "d2",
        question: "Is it ethical to have my thesis professionally edited?",
        answer:
          "Absolutely. It is a common misconception that editing is not encouraged by universities. Universities do prefer theses to have the benefit of academic editing. Universities also often provide funding to their postgraduate research students specifically for academic editing, and many supervisors require that PhD and Master’s candidates whose first language is not English have their thesis edited before submission. After all, it is in the universities’ best interests that the work of their students be presented in the best possible light.",
      },
    ],
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Reveal
            as="h2"
            className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Frequently Asked Questions
          </Reveal>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-none" />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12 text-left">
          {faqData.map((categoryGroup, catIndex) => (
            <Reveal
              key={categoryGroup.category}
              delay={catIndex * 50}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-100 dark:border-zinc-800/80 pb-2">
                {categoryGroup.category}
              </h3>

              <Accordion className="w-full">
                {categoryGroup.items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border-b border-slate-100 dark:border-zinc-800/60 last:border-0"
                  >
                    <AccordionTrigger className="text-slate-800 dark:text-zinc-200 font-semibold text-sm hover:text-indigo-600 dark:hover:text-indigo-400 py-4 transition-colors">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 dark:text-zinc-400 font-light text-sm leading-relaxed pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
