import { motion } from 'framer-motion';
import { useLanguageStore } from '@/store/index.js';
import Image from 'next/image';

const Hero = () => {
  const { language } = useLanguageStore();

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center py-12 lg:py-16">
          {/* 左侧文字内容 */}
          <div className="w-full lg:w-1/2 lg:pr-10 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">
                  {language === 'en' 
                    ? 'Discover Your Chinese Name'
                    : 'Découvrez Votre Nom Chinois'}
                </span>
                <span className="block text-indigo-600">
                  {language === 'en'
                    ? 'Where East Meets West'
                    : 'Où l\'Est Rencontre l\'Ouest'}
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl md:mt-5 md:text-xl">
                {language === 'en'
                  ? 'Experience the perfect blend of traditional Chinese culture and modern technology. Generate your meaningful Chinese name based on your personality, birth date, and aspirations.'
                  : 'Vivez la fusion parfaite de la culture chinoise traditionnelle et de la technologie moderne. Générez votre nom chinois significatif basé sur votre personnalité, date de naissance et aspirations.'}
              </p>
              <div className="mt-5 sm:mt-8">
                <div className="inline-block rounded-md shadow">
                  <a
                    href="#name-generator"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    {language === 'en' ? 'Get Your Chinese Name' : 'Obtenez Votre Nom Chinois'}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* 右侧图片内容 - 使用本地图片 */}
          <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl bg-gray-100"
            >
              {/* 使用本地中国风图片 */}
              <div className="relative w-full h-full">
                <Image 
                  src="/images/chinese-style/chinese-landscape.jpg"
                  alt="Chinese Traditional Landscape"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                
                {/* 图片上的覆盖层和文字 */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-indigo-500/30 flex flex-col items-center justify-center text-center p-6">
                  <div className="text-5xl md:text-7xl font-bold mb-2 text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>福</div>
                  <div className="h-0.5 w-12 bg-white rounded my-2"></div>
                  <span className="text-white text-xl md:text-2xl font-medium" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                    {language === 'en' ? 'Fortune & Prosperity' : 'Fortune et Prospérité'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 