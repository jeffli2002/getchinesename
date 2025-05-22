import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { playPronunciation } from '@/utils/pronunciation';

interface PronunciationButtonProps {
  pinyin: string;
  audioUrl?: string;
  onStatusChange?: (isPlaying: boolean) => void;
  chineseName?: string;
}

// 格式化拼音并添加声调标记
const formatPinyinWithTones = (pinyin: string): ReactNode => {
  if (!pinyin) return null;
  
  // 分割拼音音节
  const syllables = pinyin.split(/\s+/);
  
  return (
    <>
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
        
        // 使用data-tone属性但不影响颜色，统一样式
        return (
          <React.Fragment key={`syllable-${index}`}>
            <span data-tone={tone || "0"} className="pinyin-syllable">{syllable}</span>
            {index < syllables.length - 1 && ' '}
          </React.Fragment>
        );
      })}
    </>
  );
};

const PronunciationButton: React.FC<PronunciationButtonProps> = ({ 
  pinyin, 
  audioUrl,
  onStatusChange,
  chineseName
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 检查语音API是否可用
  useEffect(() => {
    const checkSpeechSupport = () => {
      const isSpeechSupported = 
        typeof window !== 'undefined' && 
        'speechSynthesis' in window &&
        'SpeechSynthesisUtterance' in window;
      
      setSpeechSupported(isSpeechSupported);
      
      // 预加载语音
      if (isSpeechSupported) {
        try {
          // 在某些浏览器中，需要先触发语音合成以加载语音
          const voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) {
            // 如果voices为空，可能需要等待onvoiceschanged事件
            window.speechSynthesis.onvoiceschanged = () => {
              const updatedVoices = window.speechSynthesis.getVoices();
              console.log('语音已加载:', updatedVoices.length);
            };
          }
        } catch (e) {
          console.error('预加载语音失败:', e);
        }
      }
    };
    
    checkSpeechSupport();
    
    // 在组件卸载时清理
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // 清理错误消息
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // 当播放状态变化时调用回调
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(isPlaying);
    }
  }, [isPlaying, onStatusChange]);

  // 使用原生发音API播放拼音
  const handlePlayPronunciation = async () => {
    if (isPlaying) return;
    
    // 显示拼音
    setShowPinyin(true);
    
    // 如果不支持语音API，就只显示拼音
    if (!speechSupported) {
      setErrorMessage('浏览器不支持语音功能');
      return;
    }
    
    setIsPlaying(true);
    try {
      // 预处理拼音，专为中文发音优化
      // 将带声调拼音转换为适合朗读的形式，保留空格
      let cleanPinyin = pinyin
        .replace(/[^\w\s\u00C0-\u017Fˉˊˇˋ]/g, '') // 保留所有拉丁字母、声调符号和空格
        .replace(/\s+/g, ' ')
        .trim();
      
      // 将拼音转换为中文发音文本
      // 例如：将"Xu Zi78"转换为"徐子"
      const chineseText = convertPinyinToChineseText(cleanPinyin);
      
      // 使用中文语音参数
      const utterance = new SpeechSynthesisUtterance(chineseText);
      
      // 获取所有可用的语音
      const voices = window.speechSynthesis.getVoices();
      
      // 优先选择中文语音
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh-CN') || 
        voice.lang.includes('cmn-Hans-CN')
      );
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
        console.log('使用中文语音:', chineseVoice.name);
      } else {
        // 如果没有找到中文语音，尝试其他中文方言
        const otherChineseVoice = voices.find(voice => 
          voice.lang.includes('zh') || 
          voice.lang.includes('cmn') ||
          voice.lang.includes('yue') ||
          voice.lang.includes('CN')
        );
        
        if (otherChineseVoice) {
          utterance.voice = otherChineseVoice;
          console.log('使用其他中文方言语音:', otherChineseVoice.name);
        } else {
          console.warn('未找到中文语音，使用默认语音');
        }
      }
      
      // 强制设置语音参数
      utterance.lang = 'zh-CN';  // 强制使用中文，即使没有中文语音
      utterance.rate = 0.8;      // 速度稍慢，更清晰
      utterance.pitch = 1.1;     // 略微提高音调
      utterance.volume = 1.0;    // 最大音量
      
      // 设置事件监听
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('朗读错误:', event);
        setIsPlaying(false);
        setErrorMessage('发音失败');
      };
      
      // 播放前清除之前的播放
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      
      // 设置超时保护
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
        }
      }, 5000);
      
    } catch (error) {
      console.error('播放失败:', error);
      setIsPlaying(false);
      setErrorMessage('发音功能不可用');
    }
  };
  
  // 将拼音转换为中文文本以提高发音质量
  const convertPinyinToChineseText = (pinyin: string): string => {
    // 如果有传入的中文名，优先使用
    if (chineseName && chineseName.length > 0) {
      return chineseName;
    }
    
    // 移除拼音中的声调标记，因为语音合成不需要
    const cleanPinyin = pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // 将拼音转换为中文文本
    // 例如：从"Xu Gang Yu"提取出"徐刚宇"
    
    // 如果有父元素的fullName属性，使用它
    const fullNameElement = document.querySelector('.text-xl.font-bold.text-gray-900');
    if (fullNameElement) {
      const fullName = fullNameElement.textContent || '';
      if (fullName && fullName.length > 0) {
        return fullName; // 直接返回中文名
      }
    }
    
    // 如果无法获取中文名，返回原始拼音
    return cleanPinyin;
  };

  return (
    <div className="relative">
      {/* 拼音显示 */}
      {showPinyin && (
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-full mt-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded shadow-sm whitespace-nowrap z-10 pinyin-text font-medium">
          {formatPinyinWithTones(pinyin)}
        </div>
      )}
      
      <button
        onClick={handlePlayPronunciation}
        onMouseEnter={() => setShowPinyin(true)}
        onMouseLeave={() => !isPlaying && setShowPinyin(false)}
        disabled={isPlaying}
        title={isPlaying ? "正在播放..." : "播放发音"}
        className={`p-2 rounded-full transition-colors ${
          isPlaying 
            ? 'bg-indigo-100 text-indigo-600 cursor-not-allowed' 
            : 'text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
        aria-label="播放发音"
      >
        {isPlaying ? (
          // 播放中图标（带动画效果）
          <svg 
            className="w-5 h-5 text-indigo-600 animate-pulse" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M 3 9 A 3 3 0 0 0 3 15 A 3 3 0 0 0 3 9 M 12 12 A 3 3 0 0 0 12 12 M 21 9 A 3 3 0 0 0 21 15 A 3 3 0 0 0 21 9" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          // 语音图标
          <svg 
            className="w-5 h-5 text-indigo-600" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M11.553 3.064A.75.75 0 0112 3.75v16.5a.75.75 0 01-1.255.555L5.46 16H2.75A1.75 1.75 0 011 14.25v-4.5C1 8.784 1.784 8 2.75 8h2.71l5.285-4.805a.75.75 0 01.808-.13zM18.352 5.647a.75.75 0 010 1.06 7.5 7.5 0 010 10.586.75.75 0 01-1.06-1.06 6 6 0 000-8.466.75.75 0 011.06-1.06zm-1.06 3.182a.75.75 0 010 1.06 3 3 0 010 4.242.75.75 0 01-1.06-1.06 1.5 1.5 0 000-2.121.75.75 0 011.06-1.06z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {errorMessage && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-red-100 text-red-800 text-xs rounded shadow-sm whitespace-nowrap z-10">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default PronunciationButton; 