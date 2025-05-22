import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/store/index.js';
import Image from 'next/image';

type Language = 'en' | 'fr';

const Hero = () => {
  const { language, setLanguage } = useLanguageStore();
  const currentLanguage = (language || 'en') as Language;

  // 添加图片切换状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    { src: '/images/forbidden-city.jpg', alt: { en: 'Forbidden City, Beijing', fr: 'Cité Interdite, Pékin' } },
    { src: '/images/great-wall-new.jpg', alt: { en: 'Great Wall of China', fr: 'Grande Muraille de Chine' } }
  ];

  // 自动切换图片
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000); // 每8秒切换一次图片
    
    return () => clearInterval(interval);
  }, []);

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
                  {currentLanguage === 'en'
                    ? 'Discover Your Chinese Name'
                    : 'Découvrez Votre Nom Chinois'}
                </span>
                <span className="block text-indigo-600">
                  {currentLanguage === 'en'
                    ? 'Where East Meets West'
                    : 'Où l\'Est Rencontre l\'Ouest'}
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl md:mt-5 md:text-xl">
                {currentLanguage === 'en'
                  ? 'Experience the perfect blend of traditional Chinese culture and modern technology. Generate your meaningful Chinese name based on your personality and aspirations.'
                  : 'Vivez la fusion parfaite de la culture chinoise traditionnelle et de la technologie moderne. Générez votre nom chinois significatif basé sur votre personnalité et aspirations.'}
              </p>
              <div className="mt-5 sm:mt-8">
                <div className="inline-block rounded-md shadow">
                  <a
                    href="#name-generator"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    {currentLanguage === 'en' ? 'Get Your Chinese Name' : 'Obtenez Votre Nom Chinois'}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 右侧图片内容 */}
          <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl bg-gray-100"
            >
              {/* 使用中国地标实景图片，添加切换效果 */}
              <div className="relative w-full h-full">
                {/* 加载中国地标实景图片 */}
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={currentLanguage === 'en' ? image.alt.en : image.alt.fr}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}

                {/* 图片上的覆盖层和文字 */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col items-center justify-end text-center p-6">
                  <div className="max-w-md bg-black/40 backdrop-blur-sm p-5 rounded-lg mb-6 border border-yellow-500/20">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>
                      {currentLanguage === 'en' 
                        ? 'A Perfect Chinese Name Brings Lifelong Fortune' 
                        : 'Un Nom Chinois Parfait Apporte la Fortune pour la Vie'}
                    </h3>
                    <div className="h-0.5 w-16 bg-yellow-400 rounded my-3 mx-auto"></div>
                    <p className="text-yellow-100 text-sm md:text-base" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>
                      {currentLanguage === 'en' 
                        ? 'Embody the essence of Chinese brilliant culture and ancient wisdom through your personalized name'
                        : 'Incarnez l\'essence de la brillante culture chinoise et de la sagesse ancienne à travers votre nom personnalisé'}
                    </p>
                  </div>
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