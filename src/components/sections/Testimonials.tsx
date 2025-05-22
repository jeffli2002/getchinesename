import { useLanguageStore } from '@/store/index.js';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Language = 'en' | 'fr';

interface TestimonialContent {
  en: string;
  fr: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: TestimonialContent;
  content: TestimonialContent;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: {
      en: 'Software Engineer',
      fr: 'Ingénieure Logicielle'
    },
    content: {
      en: 'The name generator provided me with a beautiful Chinese name that perfectly matches my personality. The Chinese character display is elegant and meaningful!',
      fr: 'Le générateur de noms m\'a fourni un beau nom chinois qui correspond parfaitement à ma personnalité. L\'affichage des caractères chinois est élégant et significatif !'
    },
    image: '/testimonials/sarah.jpg'
  },
  {
    id: 2,
    name: 'Pierre Dubois',
    role: {
      en: 'Marketing Director',
      fr: 'Directeur Marketing'
    },
    content: {
      en: 'As someone working with Chinese clients, having a proper Chinese name has helped me build better relationships. The pronunciation guide is very helpful.',
      fr: 'En tant que personne travaillant avec des clients chinois, avoir un nom chinois approprié m\'a aidé à établir de meilleures relations. Le guide de prononciation est très utile.'
    },
    image: '/testimonials/pierre.jpg'
  },
  {
    id: 3,
    name: 'Emma Chen',
    role: {
      en: 'Cultural Consultant',
      fr: 'Consultante Culturelle'
    },
    content: {
      en: 'I appreciate the cultural depth and accuracy of the name meanings. It\'s not just a name generator, it\'s a cultural bridge.',
      fr: 'J\'apprécie la profondeur culturelle et la précision des significations des noms. Ce n\'est pas seulement un générateur de noms, c\'est un pont culturel.'
    },
    image: '/testimonials/emma.jpg'
  }
];

const Testimonials = () => {
  const { language } = useLanguageStore();
  const currentLanguage = (language || 'en') as Language;

  return (
    <section id="testimonials" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {currentLanguage === 'en' ? 'What Our Users Say' : 'Ce que disent nos utilisateurs'}
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            {currentLanguage === 'en'
              ? 'Join thousands of satisfied users who found their perfect Chinese name'
              : 'Rejoignez des milliers d\'utilisateurs satisfaits qui ont trouvé leur nom chinois parfait'}
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      {/* 临时使用div代替Image，因为我们还没有实际图片 */}
                      <div className="absolute inset-0 bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-500">
                        {testimonial.role[currentLanguage]}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-500">
                    {testimonial.content[currentLanguage]}
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

export default Testimonials; 