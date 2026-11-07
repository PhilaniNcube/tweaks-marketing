import React, { Suspense } from "react";
import Script from "next/script";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageViewTracker from "@/components/page-view-tracker";
import WhatsappBubble from "@/components/whatsapp-bubble";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script
        id="gtm-lazy"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TPP8GGMS');`,
        }}
      />
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-TPP8GGMS"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <WhatsappBubble />
    </>
  );
}

