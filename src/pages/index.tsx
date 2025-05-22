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
        <link rel="icon" href="/favicon.ico" />
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