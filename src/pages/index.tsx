import React, { ReactNode } from 'react';
import Head from 'next/head';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import HowItWorks from '@/components/sections/HowItWorks';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import NameGenerator from '@/components/sections/NameGenerator';

export default function Home() {
  return (
    <>
      <Head>
        <title>Chinese Name Generator - Find Your Perfect Chinese Name</title>
        <meta name="description" content="Generate meaningful Chinese names based on your original name, birth date, and personality. Experience the beauty of Chinese culture and calligraphy." />
        <meta name="keywords" content="Chinese name generator, Chinese names, Chinese culture, calligraphy, name meaning, Chinese characters, 中文名字生成器" />
        <meta name="author" content="Get Chinese Name" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://www.getachinesename.fun/" />
        
        {/* Open Graph tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Chinese Name Generator - Find Your Perfect Chinese Name" />
        <meta property="og:description" content="Generate meaningful Chinese names based on your original name, birth date, and personality. Experience the beauty of Chinese culture and calligraphy." />
        <meta property="og:url" content="https://www.getachinesename.fun/" />
        <meta property="og:site_name" content="Get Chinese Name" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="zh_CN" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Chinese Name Generator - Find Your Perfect Chinese Name" />
        <meta name="twitter:description" content="Generate meaningful Chinese names based on your original name, birth date, and personality." />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="en,zh" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Chinese Name Generator",
              "description": "Generate meaningful Chinese names based on your original name, birth date, and personality.",
              "url": "https://www.getachinesename.fun/",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </Head>

      <Hero />
      <NameGenerator />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
    </>
  );
} 