import { useLanguageStore } from '@/store';
import { motion } from 'framer-motion';

// 定义语言类型
type Language = 'en' | 'fr';

// 定义步骤项接口
interface StepItem {
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
}

// 步骤数据
const steps: StepItem[] = [
  {
    title: {
      en: 'Enter Your Information',
      fr: 'Entrez Vos Informations'
    },
    description: {
      en: 'Provide your name, birth date, gender, and profession.',
      fr: 'Fournissez votre nom, date de naissance, genre et profession.'
    },
    icon: '📝'
  },
  {
    title: {
      en: 'Name Generation',
      fr: 'Génération du Nom'
    },
    description: {
      en: 'Our algorithm analyzes your information to create meaningful Chinese names.',
      fr: 'Notre algorithme analyse vos informations pour créer des noms chinois significatifs.'
    },
    icon: '⚡'
  },
  {
    title: {
      en: 'View Results',
      fr: 'Voir les Résultats'
    },
    description: {
      en: 'Get three unique name options with detailed explanations and calligraphy.',
      fr: 'Obtenez trois options de noms uniques avec des explications détaillées et de la calligraphie.'
    },
    icon: '🎯'
  },
  {
    title: {
      en: 'Learn & Share',
      fr: 'Apprendre & Partager'
    },
    description: {
      en: 'Learn to pronounce your name and share it with friends.',
      fr: 'Apprenez à prononcer votre nom et partagez-le avec vos amis.'
    },
    icon: '📱'
  }
];

const HowItWorks = () => {
  const { language } = useLanguageStore();
  // 确保语言类型安全，默认为英语
  const currentLang: Language = (language === 'en' || language === 'fr') ? language : 'en';

  return (
    <section id="how-it-works" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {currentLang === 'en' ? 'How It Works' : 'Comment ça marche'}
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            {currentLang === 'en'
              ? 'Get your Chinese name in four simple steps'
              : 'Obtenez votre nom chinois en quatre étapes simples'}
          </p>
        </div>

        <div className="mt-12">
          {/* 桌面版布局 */}
          <div className="hidden md:grid md:grid-cols-4 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* 步骤连接线 */}
                {index < steps.length - 1 && (
                  <div className="absolute top-12 right-0 w-full h-0.5 bg-indigo-100 z-0">
                    <div className="absolute right-0 w-4 h-4 -mt-1.5 -mr-2 rounded-full bg-indigo-100"></div>
                  </div>
                )}
                
                <div className="relative bg-white rounded-lg shadow-sm p-6 h-full z-10 border border-gray-100 hover:border-indigo-100 transition-all">
                  <div className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {index + 1}
                  </div>
                  <div className="pt-6">
                    <div className="text-3xl mb-3">{step.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title[currentLang]}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {step.description[currentLang]}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 移动端布局 */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex border rounded-lg bg-white shadow-sm overflow-hidden"
              >
                <div className="bg-indigo-600 w-16 flex-shrink-0 flex flex-col items-center justify-center text-white">
                  <div className="text-2xl font-bold">{index + 1}</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-2xl">{step.icon}</div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {step.title[currentLang]}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {step.description[currentLang]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 