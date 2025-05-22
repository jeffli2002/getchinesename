import React, { ReactNode } from 'react';
import { useLanguageStore } from '@/store/index.js';
import { motion } from 'framer-motion';
import { GiQuill } from 'react-icons/gi';

type Language = 'en' | 'fr';

interface FeatureContent {
  en: string;
  fr: string;
}

interface Feature {
  id?: number;
  title: FeatureContent;
  description: FeatureContent;
  icon: ReactNode;
}

const features: Feature[] = [
  {
    title: {
      en: 'Cultural Integration',
      fr: 'Intégration Culturelle'
    },
    description: {
      en: 'Combines traditional Chinese culture with modern technology to create meaningful names.',
      fr: 'Combine la culture chinoise traditionnelle avec la technologie moderne pour créer des noms significatifs.'
    },
    icon: '🎨'
  },
  {
    title: {
      en: 'Personalized Names',
      fr: 'Noms Personnalisés'
    },
    description: {
      en: 'Generate names based on your personality, birth date, and profession.',
      fr: 'Générez des noms basés sur votre personnalité, date de naissance et profession.'
    },
    icon: '✨'
  },
  {
    id: 3,
    icon: <GiQuill className="h-6 w-6 text-indigo-500" />,
    title: {
      en: 'Chinese Typography',
      fr: 'Typographie Chinoise',
    },
    description: {
      en: 'View your name in elegant Chinese typography with proper character display.',
      fr: 'Visualisez votre nom en typographie chinoise élégante avec un affichage correct des caractères.',
    },
  },
  {
    title: {
      en: 'Pronunciation Guide',
      fr: 'Guide de Prononciation'
    },
    description: {
      en: 'Learn how to pronounce your Chinese name correctly.',
      fr: 'Apprenez à prononcer correctement votre nom chinois.'
    },
    icon: '🔊'
  },
  {
    title: {
      en: 'Name Analysis',
      fr: 'Analyse du Nom'
    },
    description: {
      en: 'Detailed explanation of your name\'s meaning and cultural significance.',
      fr: 'Explication détaillée de la signification de votre nom et de son importance culturelle.'
    },
    icon: '📚'
  },
  {
    title: {
      en: 'Bilingual Support',
      fr: 'Support Bilingue'
    },
    description: {
      en: 'Available in both English and French for a global audience.',
      fr: 'Disponible en anglais et en français pour un public international.'
    },
    icon: '🌍'
  }
];

const Features = () => {
  const { language } = useLanguageStore();
  const currentLanguage = (language || 'en') as Language;

  return (
    <section id="features" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {currentLanguage === 'en' ? 'Features' : 'Fonctionnalités'}
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            {currentLanguage === 'en'
              ? 'Discover the unique features of our Chinese name generator'
              : 'Découvrez les fonctionnalités uniques de notre générateur de noms chinois'}
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-6 bg-white rounded-lg shadow-lg"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium text-gray-900">
                  {feature.title[currentLanguage]}
                </h3>
                <p className="mt-2 text-gray-500">
                  {feature.description[currentLanguage]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 