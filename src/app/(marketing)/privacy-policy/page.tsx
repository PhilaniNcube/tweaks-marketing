import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      
      {/* Breadcrumb Navigation */}
      <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-left flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-tweaks-blue transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-400 dark:text-zinc-600">Legal</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-900 dark:text-white">Privacy Policy</span>
        </div>
      </div>

      {/* Header Section */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-none border border-indigo-100 dark:border-indigo-900 mb-2">
            <ShieldCheck className="h-8 w-8 text-tweaks-blue" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-light uppercase tracking-widest">
            Last updated: August 2021
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12 text-left">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. General Information</h2>
            <div className="space-y-3 text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              <p>This privacy policy is for your, and our, protection, and is to inform you of how we use the data you consent to give us.</p>
              <p>Please read the information below. We value every single client and website visitor and this information is for the protection of all parties.</p>
              <p>Our business is called “Tweaks Academic” (formerly Concept Afrika), and is owned by Chengetai Chikadaya and Trevor Mazhandu.</p>
              <p>You can contact us at <a href="mailto:chengetai@conceptafrika.com" className="text-tweaks-blue font-semibold hover:underline">chengetai@conceptafrika.com</a>.</p>
              <p>When you submit an enquiry by sending us an email (either directly, or by submitting a message through the contact form on this website), you consent to us collecting this information, and using it to communicate with you.</p>
              <p>When you enter your information (first name, last name, email address) into an email opt-in form in order to download a free product/guide/e-book, you consent to us collecting this information, and using it to communicate with you.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Personal Data That We Process</h2>
            <p className="text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">We collect personal data, transactional data, and technical data.</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              <li><strong>Personal data:</strong> When you fill in our contact form to send us a message, and/or fill in our email opt-in forms, we collect your first name, last name and email address. When you book an appointment through our website, we collect your first name, last name and email address.</li>
              <li><strong>Transactional data:</strong> When you make a purchase from our shop, we collect information about what service(s) you purchased, as well as the account details you supply to us to create your customer account. This includes data for billing such as company name, company location, company ID and/or VAT number (if applicable).</li>
              <li><strong>Technical data:</strong> When you visit our website, we collect information about cookies.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Special and/or Sensitive Personal Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              <li>We do not process special or sensitive data.</li>
              <li>Our website and/or service does not intend to collect data about website visitors who are younger than 16 years, unless they have permission from parents or guardians. However, we cannot check if a visitor is older than 16 years of age.</li>
              <li>We encourage parents to be involved in the online activities of their children, in order to prevent data about children being collected without parental consent.</li>
              <li>If you are convinced that we have collected personal information about a minor without this permission, please contact us for removal.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Purpose and Basis of Processing Personal Data</h2>
            <p className="text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">We process your personal data for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              <li>To contact you if necessary to carry out our services.</li>
              <li>To deliver goods and services to you.</li>
              <li>Handling your payment.</li>
              <li>Sending our newsletter.</li>
              <li>Inform you about changes to our services and products.</li>
              <li>Allow you to create an account.</li>
              <li>We also process personal data if we are legally obliged to do so, such as information that we need for our tax return.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. View, Modify or Delete Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              <li>You have the right to view, correct or delete your personal data. You also have the right to withdraw your consent to the data processing or to object to the processing of your personal data and you have the right to data portability. This means that you can submit a request to us to send the personal information we hold to you or another organisation mentioned by you in a computer file.</li>
              <li>You can send a request for access, correction, deletion, data transfer of your personal data or request for cancellation of your consent or objection to the processing of your personal data to our contact email.</li>
              <li>To ensure that the request for access has been made by you, we ask you to send a copy of your ID with the request. Make your passport photo, MRZ (machine readable zone, the strip with numbers at the bottom of the passport), passport number and Citizen Service Number black in this copy. This is to protect your privacy.</li>
              <li>We respond as quickly as possible, but within four weeks, at your request.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. How We Protect Personal Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              <li>We take the protection of your data seriously and take appropriate measures to prevent misuse, loss, unauthorised access, unwanted disclosure and unauthorised modification.</li>
              <li>Our website is scanned on a regular basis for security holes and known vulnerabilities in order to make your visit to our site as safe as possible.</li>
              <li>Our website uses encryption for data transfer by means of an SSL certificate. If you feel that your data is not properly secured or there are indications of abuse, please contact us.</li>
              <li>We use regular malware scanning.</li>
              <li>Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology.</li>
              <li>We implement a variety of security measures when a user places an order to maintain the safety of your personal information.</li>
              <li>All transactions are processed through a gateway provider and are not stored or processed on our servers.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">7. 3rd Party Services</h2>
            <p className="text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              <strong>Google Fonts:</strong> We use Google Fonts to serve the fonts on this website.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">8. Amendments</h2>
            <p className="text-slate-600 dark:text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
              We reserve the right to make changes to this privacy policy.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
