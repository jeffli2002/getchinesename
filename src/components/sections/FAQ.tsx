import React, { ReactNode } from 'react';
import { useState } from 'react';
import { useLanguageStore } from '@/store/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ as FAQType } from '@/types';

const faqs: FAQType[] = [
  {
    id: 1,
    question: {
      en: 'How accurate are the generated names?',
      fr: 'Quelle est la précision des noms générés ?'
    },
    answer: {
      en: 'Our algorithm considers multiple factors including pronunciation similarity, cultural significance, and gender appropriateness to generate accurate and meaningful Chinese names.',
      fr: 'Notre algorithme prend en compte plusieurs facteurs, notamment la similarité de prononciation, la signification culturelle et l\'adéquation au genre pour générer des noms chinois précis et significatifs.'
    }
  },
  {
    id: 2,
    question: {
      en: 'Can I use the generated name legally?',
      fr: 'Puis-je utiliser le nom généré légalement ?'
    },
    answer: {
      en: 'Yes, you can use the generated name for personal or business purposes. However, we recommend consulting with local authorities if you plan to use it for official documents.',
      fr: 'Oui, vous pouvez utiliser le nom généré à des fins personnelles ou professionnelles. Cependant, nous vous recommandons de consulter les autorités locales si vous prévoyez de l\'utiliser pour des documents officiels.'
    }
  },
  {
    id: 3,
    question: {
      en: 'How do I pronounce my Chinese name?',
      fr: 'Comment prononcer mon nom chinois ?'
    },
    answer: {
      en: 'Each generated name comes with a pronunciation guide and audio recording. You can click the speaker icon to hear the correct pronunciation.',
      fr: 'Chaque nom généré est accompagné d\'un guide de prononciation et d\'un enregistrement audio. Vous pouvez cliquer sur l\'icône du haut-parleur pour entendre la prononciation correcte.'
    }
  },
  {
    id: 4,
    question: {
      en: 'Can I get more than three name options?',
      fr: 'Puis-je obtenir plus de trois options de noms ?'
    },
    answer: {
      en: 'Currently, we provide three carefully selected name options. If you\'re not satisfied with the options, you can regenerate new names by adjusting your input information.',
      fr: 'Actuellement, nous fournissons trois options de noms soigneusement sélectionnées. Si vous n\'êtes pas satisfait des options, vous pouvez régénérer de nouveaux noms en ajustant vos informations d\'entrée.'
    }
  },
  {
    id: 5,
    question: {
      en: 'What makes these Chinese names culturally appropriate?',
      fr: 'Qu\'est-ce qui rend ces noms chinois culturellement appropriés ?'
    },
    answer: {
      en: 'Our naming system integrates traditional Chinese naming conventions, balances the five elements of Chinese philosophy, and considers the cultural and historical significance of each character.',
      fr: 'Notre système de nommage intègre les conventions traditionnelles chinoises, équilibre les cinq éléments de la philosophie chinoise et tient compte de la signification culturelle et historique de chaque caractère.'
    }
  }
];

const FAQ = () => {
  const { language } = useLanguageStore();
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleQuestion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {language === 'en' ? 'Frequently Asked Questions' : 'Questions Fréquemment Posées'}
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            {language === 'en'
              ? 'Find answers to common questions about our Chinese name generator'
              : 'Trouvez des réponses aux questions courantes sur notre générateur de noms chinois'}
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left focus:outline-none flex justify-between items-center"
                  onClick={() => toggleQuestion(faq.id)}
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {faq.question[language as keyof typeof faq.question]}
                  </h3>
                  <span className="ml-6 flex-shrink-0 text-gray-500">
                    {openId === faq.id ? '−' : '+'}
                  </span>
                </button>
                
                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-500">
                        {faq.answer[language as keyof typeof faq.answer]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 