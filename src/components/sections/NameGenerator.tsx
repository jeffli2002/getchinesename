import React, { useState } from 'react';
import { useLanguageStore } from '@/store/index.js';
import { useNameGenerator } from '@/hooks/useNameGenerator';
import { NameInput } from '@/types';
import PronunciationButton from '@/components/common/PronunciationButton';
import { motion } from 'framer-motion';
import { FiShare2, FiCheck } from 'react-icons/fi';

// 格式化拼音并标记声调样式
const formatPinyin = (pinyin: string): React.ReactNode => {
  if (!pinyin) return null;
  
  // 分割拼音音节
  const syllables = pinyin.split(/\s+/);
  
  return (
    <span className="pinyin-text">
      {syllables.map((syllable, index) => {
        // 检测声调标记 - 保留检测逻辑用于accessibility和未来功能
        let tone = 0;
        
        if (syllable.includes('ā') || syllable.includes('ē') || 
            syllable.includes('ī') || syllable.includes('ō') || 
            syllable.includes('ū') || syllable.includes('ǖ')) {
          tone = 1; // 第一声
        } else if (syllable.includes('á') || syllable.includes('é') || 
                   syllable.includes('í') || syllable.includes('ó') || 
                   syllable.includes('ú') || syllable.includes('ǘ')) {
          tone = 2; // 第二声
        } else if (syllable.includes('ǎ') || syllable.includes('ě') || 
                   syllable.includes('ǐ') || syllable.includes('ǒ') || 
                   syllable.includes('ǔ') || syllable.includes('ǚ')) {
          tone = 3; // 第三声
        } else if (syllable.includes('à') || syllable.includes('è') || 
                   syllable.includes('ì') || syllable.includes('ò') || 
                   syllable.includes('ù') || syllable.includes('ǜ')) {
          tone = 4; // 第四声
        }
        
        // 使用data-tone属性但统一颜色样式
        return (
          <React.Fragment key={`syllable-${index}`}>
            <span data-tone={tone || "0"} className="pinyin-syllable">{syllable}</span>
            {index < syllables.length - 1 && ' '}
          </React.Fragment>
        );
      })}
    </span>
  );
};

// 简单的名字含义数据库，这里可以扩展
const nameMeanings: Record<string, { en: string; fr: string }> = {
  // 常见英文名
  'john': { en: 'God is gracious', fr: 'Dieu est miséricordieux' },
  'mary': { en: 'Star of the sea', fr: 'Étoile de la mer' },
  'james': { en: 'Supplanter', fr: 'Celui qui supplante' },
  'robert': { en: 'Bright fame', fr: 'Renommée brillante' },
  'michael': { en: 'Who is like God?', fr: 'Qui est comme Dieu?' },
  'william': { en: 'Resolute protector', fr: 'Protecteur résolu' },
  'david': { en: 'Beloved', fr: 'Bien-aimé' },
  'richard': { en: 'Strong ruler', fr: 'Dirigeant fort' },
  'joseph': { en: 'God will increase', fr: 'Dieu augmentera' },
  'thomas': { en: 'Twin', fr: 'Jumeau' },
  'charles': { en: 'Free man', fr: 'Homme libre' },
  'christopher': { en: 'Christ-bearer', fr: 'Porteur du Christ' },
  'daniel': { en: 'God is my judge', fr: 'Dieu est mon juge' },
  'matthew': { en: 'Gift of God', fr: 'Don de Dieu' },
  'anthony': { en: 'Priceless', fr: 'Inestimable' },
  'mark': { en: 'Warlike', fr: 'Guerrier' },
  'donald': { en: 'World ruler', fr: 'Dirigeant du monde' },
  'steven': { en: 'Crown', fr: 'Couronne' },
  'paul': { en: 'Small', fr: 'Petit' },
  'andrew': { en: 'Manly', fr: 'Viril' },
  'elizabeth': { en: 'God is my oath', fr: 'Dieu est mon serment' },
  'jennifer': { en: 'White wave', fr: 'Vague blanche' },
  'linda': { en: 'Pretty', fr: 'Jolie' },
  'patricia': { en: 'Noble', fr: 'Noble' },
  'susan': { en: 'Lily', fr: 'Lys' },
  'jessica': { en: 'God beholds', fr: 'Dieu regarde' },
  'sarah': { en: 'Princess', fr: 'Princesse' },
  'karen': { en: 'Pure', fr: 'Pure' },
  'nancy': { en: 'Grace', fr: 'Grâce' },
  'margaret': { en: 'Pearl', fr: 'Perle' },
  
  // 常见法语名
  'jean': { en: 'God is gracious', fr: 'Dieu est miséricordieux' },
  'pierre': { en: 'Rock', fr: 'Pierre' },
  'michel': { en: 'Who is like God?', fr: 'Qui est comme Dieu?' },
  'jacques': { en: 'Supplanter', fr: 'Celui qui supplante' },
  'françois': { en: 'Free one', fr: 'Celui qui est libre' },
  'andré': { en: 'Manly', fr: 'Viril' },
  'philippe': { en: 'Lover of horses', fr: 'Ami des chevaux' },
  'louis': { en: 'Famous warrior', fr: 'Guerrier célèbre' },
  'henri': { en: 'Home ruler', fr: 'Maître de maison' },
  'marie': { en: 'Star of the sea', fr: 'Étoile de la mer' },
  'jeanne': { en: 'God is gracious', fr: 'Dieu est miséricordieux' },
  'catherine': { en: 'Pure', fr: 'Pure' },
  'anne': { en: 'Grace', fr: 'Grâce' },
  'marguerite': { en: 'Pearl', fr: 'Perle' },
  'élisabeth': { en: 'God is my oath', fr: 'Dieu est mon serment' },
  
  // 额外增加的常见英文名
  'emma': { en: 'Universal', fr: 'Universelle' },
  'olivia': { en: 'Olive tree', fr: 'Olivier' },
  'noah': { en: 'Rest, comfort', fr: 'Repos, confort' },
  'liam': { en: 'Strong-willed warrior', fr: 'Guerrier déterminé' },
  'sophia': { en: 'Wisdom', fr: 'Sagesse' },
  'charlotte': { en: 'Free man', fr: 'Homme libre' },
  'amelia': { en: 'Work', fr: 'Travail' },
  'oliver': { en: 'Olive tree', fr: 'Olivier' },
  'isabella': { en: 'Pledged to God', fr: 'Promis à Dieu' },
  'lucas': { en: 'Bringer of light', fr: 'Porteur de lumière' },
  'mia': { en: 'Mine, beloved', fr: 'Mienne, bien-aimée' },
  'henry': { en: 'Ruler of the home', fr: 'Maître de maison' },
  'evelyn': { en: 'Beautiful bird', fr: 'Bel oiseau' },
  'alexander': { en: 'Defender of the people', fr: 'Défenseur du peuple' },
  'harper': { en: 'Harp player', fr: 'Joueur de harpe' },
  'benjamin': { en: 'Son of the right hand', fr: 'Fils de la main droite' },
  'abigail': { en: 'Father\'s joy', fr: 'Joie du père' },
  'ethan': { en: 'Strong, firm', fr: 'Fort, ferme' },
  'emily': { en: 'Industrious', fr: 'Industrieuse' },
  'samuel': { en: 'Heard by God', fr: 'Entendu par Dieu' },
  'elijah': { en: 'My God is Yahweh', fr: 'Mon Dieu est Yahvé' },
  'grace': { en: 'Elegance, blessing', fr: 'Élégance, bénédiction' },
  'avery': { en: 'Ruler of the elves', fr: 'Maître des elfes' },
  'sofia': { en: 'Wisdom', fr: 'Sagesse' },
  'jackson': { en: 'Son of Jack', fr: 'Fils de Jack' },
  'scarlett': { en: 'Red', fr: 'Rouge' },
  'madison': { en: 'Son of Maud', fr: 'Fils de Maud' },
  'alfie': { en: 'Wise counselor', fr: 'Conseiller sage' },
  'archie': { en: 'Truly bold', fr: 'Vraiment audacieux' },
  'george': { en: 'Farmer', fr: 'Agriculteur' },
  'charlie': { en: 'Free man', fr: 'Homme libre' },
  'oscar': { en: 'God\'s spear', fr: 'Lance de Dieu' },
  'leo': { en: 'Lion', fr: 'Lion' },
  'arthur': { en: 'Bear', fr: 'Ours' },
  'harry': { en: 'Home ruler', fr: 'Maître de maison' },
  'adam': { en: 'Earth, man', fr: 'Terre, homme' },
  'joshua': { en: 'God is salvation', fr: 'Dieu est le salut' },
  'max': { en: 'Greatest', fr: 'Le plus grand' },
  'peter': { en: 'Rock', fr: 'Pierre' },
  'alice': { en: 'Noble, truth', fr: 'Noble, vérité' },
  'ella': { en: 'Fairy maiden', fr: 'Jeune fée' },
  'lily': { en: 'Pure, passion', fr: 'Pure, passion' },
  'chloe': { en: 'Blooming', fr: 'Florissante' },
  'hannah': { en: 'Grace', fr: 'Grâce' },
  'laura': { en: 'Laurel tree', fr: 'Laurier' },
  'rose': { en: 'Flower, rose', fr: 'Fleur, rose' },
  
  // 额外增加的常见法语名
  'sophie': { en: 'Wisdom', fr: 'Sagesse' },
  'chloé': { en: 'Blooming', fr: 'Florissante' },
  'léa': { en: 'Delicate, weary', fr: 'Délicate, fatiguée' },
  'manon': { en: 'Bitter', fr: 'Amère' },
  'camille': { en: 'Young ceremonial attendant', fr: 'Jeune assistant de cérémonie' },
  'lucie': { en: 'Light', fr: 'Lumière' },
  'zoé': { en: 'Life', fr: 'Vie' },
  'lola': { en: 'Sorrows', fr: 'Peines' },
  'louise': { en: 'Famous warrior', fr: 'Guerrier célèbre' },
  'gabriel': { en: 'God is my strength', fr: 'Dieu est ma force' },
  'hugo': { en: 'Mind, intellect', fr: 'Esprit, intellect' },
  'jules': { en: 'Youthful', fr: 'Jeune' },
  'antoine': { en: 'Priceless', fr: 'Inestimable' }
};

// 获取原始名字的含义，如果未找到返回默认值
const getOriginalNameMeaning = (name: string, language: 'en' | 'fr'): string => {
  if (!name) return language === 'en' ? 'unique and special' : 'unique et spécial';
  
  const lowerName = name.toLowerCase();
  
  // 检查完整名字
  if (nameMeanings[lowerName]) {
    return nameMeanings[lowerName][language];
  }
  
  // 检查名字的第一部分（针对复合名字）
  const firstPart = lowerName.split(' ')[0];
  if (nameMeanings[firstPart]) {
    return nameMeanings[firstPart][language];
  }
  
  // 检查名字的最后一部分（可能是姓氏）
  const nameParts = lowerName.split(' ');
  if (nameParts.length > 1) {
    const lastName = nameParts[nameParts.length - 1];
    if (nameMeanings[lastName]) {
      return nameMeanings[lastName][language];
    }
  }
  
  // 检查名字的任何部分是否匹配
  for (const part of lowerName.split(' ')) {
    if (nameMeanings[part]) {
      return nameMeanings[part][language];
    }
  }
  
  // 检查名字是否包含已知名字（部分匹配）
  for (const [key, value] of Object.entries(nameMeanings)) {
    if (lowerName.includes(key)) {
      return value[language];
    }
  }
  
  // 根据名字的首字母提供一个个性化的默认含义
  const firstLetter = lowerName.charAt(0).toLowerCase();
  const letterMeanings: Record<string, { en: string; fr: string }> = {
    'a': { en: 'ambitious and adventurous', fr: 'ambitieux et aventureux' },
    'b': { en: 'brave and bold', fr: 'brave et audacieux' },
    'c': { en: 'creative and caring', fr: 'créatif et attentionné' },
    'd': { en: 'determined and diligent', fr: 'déterminé et diligent' },
    'e': { en: 'elegant and energetic', fr: 'élégant et énergique' },
    'f': { en: 'friendly and faithful', fr: 'amical et fidèle' },
    'g': { en: 'generous and gracious', fr: 'généreux et gracieux' },
    'h': { en: 'honest and humble', fr: 'honnête et humble' },
    'i': { en: 'intelligent and intuitive', fr: 'intelligent et intuitif' },
    'j': { en: 'joyful and just', fr: 'joyeux et juste' },
    'k': { en: 'kind and knowledgeable', fr: 'gentil et bien informé' },
    'l': { en: 'loving and loyal', fr: 'aimant et loyal' },
    'm': { en: 'motivated and mindful', fr: 'motivé et attentif' },
    'n': { en: 'noble and nurturing', fr: 'noble et nourrissant' },
    'o': { en: 'optimistic and observant', fr: 'optimiste et observateur' },
    'p': { en: 'passionate and patient', fr: 'passionné et patient' },
    'q': { en: 'quick-witted and quiet', fr: 'vif d\'esprit et calme' },
    'r': { en: 'respectful and reliable', fr: 'respectueux et fiable' },
    's': { en: 'sincere and supportive', fr: 'sincère et encourageant' },
    't': { en: 'thoughtful and tenacious', fr: 'réfléchi et tenace' },
    'u': { en: 'understanding and unique', fr: 'compréhensif et unique' },
    'v': { en: 'valiant and versatile', fr: 'vaillant et polyvalent' },
    'w': { en: 'wise and warm', fr: 'sage et chaleureux' },
    'x': { en: 'exceptional and exciting', fr: 'exceptionnel et passionnant' },
    'y': { en: 'yearning and youthful', fr: 'désireux et jeune' },
    'z': { en: 'zealous and zestful', fr: 'zélé et enthousiaste' }
  };
  
  if (letterMeanings[firstLetter]) {
    return letterMeanings[firstLetter][language];
  }
  
  // 如果所有尝试都失败，返回通用描述
  return language === 'en' 
    ? `unique and holds special meaning in its culture of origin` 
    : `unique et possède une signification particulière dans sa culture d'origine`;
};

const NameGenerator: React.FC = () => {
  const { language } = useLanguageStore();
  const { loading, names, error, hasGenerated, generate } = useNameGenerator();
  const [input, setInput] = useState<NameInput>({
    originalName: '',
    gender: 'male'
  });
  const [shareStatus, setShareStatus] = useState<Record<number, { copied: boolean }>>({});
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'kai' | 'xing'>('kai'); // 默认显示楷书

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generate(input);
  };

  // 显示不同字体样式的汉字
  const renderChineseCharacter = (character: string) => {
    return (
      <div className="relative h-full w-full border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          {activeTab === 'kai' ? (
            <div className="font-kai text-6xl font-bold">
              {character}
            </div>
          ) : (
            <div className="font-xing-container overflow-x-auto whitespace-nowrap">
              <div className="font-xing text-7xl inline-block" style={{letterSpacing: "0.1em"}}>
                {character}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 分享功能
  const handleShare = async (name: any, index: number) => {
    const shareText = language === 'en' 
      ? `Check out my Chinese name: ${name.fullName} (${name.pinyin}) - Generated at Chinese Name Generator` 
      : `Découvrez mon nom chinois: ${name.fullName} (${name.pinyin}) - Généré par Générateur de Noms Chinois`;
    
    // 构建网页地址
    const url = window.location.href;
    
    try {
      // 优先使用原生分享API (移动设备)
      if (navigator.share) {
        await navigator.share({
          title: language === 'en' ? 'My Chinese Name' : 'Mon Nom Chinois',
          text: shareText,
          url: url
        });
        return;
      }
      
      // 桌面设备回退到复制分享文本
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      
      // 更新状态显示复制成功
      setShareStatus(prev => ({
        ...prev,
        [index]: { copied: true }
      }));
      
      // 3秒后重置状态
      setTimeout(() => {
        setShareStatus(prev => ({
          ...prev,
          [index]: { copied: false }
        }));
      }, 3000);
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  return (
    <section id="name-generator" className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {language === 'en' ? 'Generate Your Chinese Name' : 'Générez Votre Nom Chinois'}
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            {language === 'en'
              ? 'Enter your name and gender to generate a meaningful Chinese name that matches your identity'
              : 'Entrez votre nom et genre pour générer un nom chinois significatif qui correspond à votre identité'}
          </p>
        </div>

        <div className="mt-10">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="originalName" className="block text-sm font-medium text-gray-700">
                  {language === 'en' ? 'Your Name' : 'Votre Nom'}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="originalName"
                    id="originalName"
                    value={input.originalName}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  {language === 'en' ? 'Gender' : 'Genre'}
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    value={input.gender}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-300"
                    required
                  >
                    <option value="male">{language === 'en' ? 'Male' : 'Masculin'}</option>
                    <option value="female">{language === 'en' ? 'Female' : 'Féminin'}</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300`}
              >
                {loading
                  ? (language === 'en' ? 'Generating...' : 'Génération...')
                  : (language === 'en' ? 'Generate Names' : 'Générer des Noms')}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {hasGenerated && names.length > 0 && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'en' ? 'Your Chinese Names' : 'Vos Noms Chinois'}
              </h3>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {names.map((name, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900" data-chinese-name={name.fullName}>{name.fullName}</h4>
                          <p className="text-sm text-gray-500 pinyin-text">{formatPinyin(name.pinyin)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleShare(name, index)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors duration-300"
                            title={language === 'en' ? 'Share' : 'Partager'}
                          >
                            {shareStatus[index]?.copied ? <FiCheck className="h-5 w-5 text-green-500" /> : <FiShare2 className="h-5 w-5" />}
                          </button>
                          <PronunciationButton 
                            pinyin={name.pinyin}
                            audioUrl={name.pronunciation}
                            chineseName={name.fullName}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {/* 字体样式选项卡 */}
                        <div className="flex border-b mb-2">
                          <button
                            className={`py-2 px-4 font-medium text-sm transition-all duration-300 ${
                              activeTab === 'kai' 
                                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('kai')}
                          >
                            {language === 'en' ? 'Regular Script' : 'Style Régulier'}
                          </button>
                          <button
                            className={`py-2 px-4 font-medium text-sm transition-all duration-300 ${
                              activeTab === 'xing' 
                                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('xing')}
                          >
                            {language === 'en' ? 'Running Script' : 'Style Cursif'}
                          </button>
                        </div>
                        
                        <div className="h-48 bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition-colors duration-300">
                          {renderChineseCharacter(name.calligraphy[activeTab])}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h5 className="font-medium text-gray-900 border-b pb-2 mb-3">
                          {language === 'en' ? 'Name Meaning' : 'Signification du Nom'}
                        </h5>
                        <div className="mt-2 text-sm text-gray-600 space-y-3">
                          {/* 原始名字部分 */}
                          <div 
                            className={`p-2 rounded-md transition-all duration-300 ${hoveredSection === `original-${index}` ? 'bg-indigo-50' : ''}`}
                            onMouseEnter={() => setHoveredSection(`original-${index}`)}
                            onMouseLeave={() => setHoveredSection(null)}
                          >
                            <p className="mb-1">
                              <span className="font-medium text-indigo-700">{language === 'en' ? 'Original Name' : 'Nom d\'origine'} ({name.originalName}):</span> {language === 'en' 
                                ? `The name "${name.originalName}" often means "${getOriginalNameMeaning(name.originalName, 'en')}" in its culture of origin.` 
                                : `Le nom "${name.originalName}" signifie souvent "${getOriginalNameMeaning(name.originalName, 'fr')}" dans sa culture d'origine.`}
                            </p>
                          </div>
                          
                          {/* 分割线 */}
                          <div className="border-t border-gray-200 my-2"></div>
                          
                          {/* 姓氏部分 */}
                          <div 
                            className={`p-2 rounded-md transition-all duration-300 ${hoveredSection === `surname-${index}` ? 'bg-indigo-50' : ''}`}
                            onMouseEnter={() => setHoveredSection(`surname-${index}`)}
                            onMouseLeave={() => setHoveredSection(null)}
                          >
                            <p className="mb-1">
                              <span className="font-medium text-indigo-700">{language === 'en' ? 'Surname' : 'Nom de famille'} ({name.surname}):</span> {name.surnameMeaning[language as keyof typeof name.surnameMeaning]} {name.nameRelation?.phoneticSimilarity}
                            </p>
                          </div>
                          
                          {/* 分割线 */}
                          <div className="border-t border-gray-200 my-2"></div>
                          
                          {/* 名字部分 */}
                          <div 
                            className={`p-2 rounded-md transition-all duration-300 ${hoveredSection === `given-${index}` ? 'bg-indigo-50' : ''}`}
                            onMouseEnter={() => setHoveredSection(`given-${index}`)}
                            onMouseLeave={() => setHoveredSection(null)}
                          >
                            <p className="mb-1">
                              <span className="font-medium text-indigo-700">{language === 'en' ? 'Given name' : 'Prénom'} ({name.givenName}):</span> {name.givenNameMeaning[language as keyof typeof name.givenNameMeaning]} {name.nameRelation?.meaningConnection}
                            </p>
                          </div>
                          
                          {/* 文化背景信息 */}
                          <div className="mt-3 border-t border-gray-200 pt-2">
                            <p className="text-xs italic text-gray-500">
                              {name.nameRelation?.culturalContext}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 分享提示 */}
                      {shareStatus[index]?.copied && (
                        <div className="mt-4 py-2 px-3 bg-green-50 text-green-700 text-xs rounded-md transition-opacity duration-300">
                          {language === 'en' ? 'Copied to clipboard!' : 'Copié dans le presse-papiers !'}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NameGenerator; 