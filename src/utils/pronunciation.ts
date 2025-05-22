import { GeneratedName } from '@/types';

// 模拟的发音API
const PRONUNCIATION_API_URL = '/api/pronunciation';

// 声明全局变量用于语音合成
let speechSynthesisSupported = false;
let voices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

// 检查浏览器环境
const isBrowser = typeof window !== 'undefined';

// 在客户端初始化语音合成
if (isBrowser && 'speechSynthesis' in window) {
  try {
    speechSynthesisSupported = true;
    
    // 获取可用的语音
    const loadVoices = () => {
      try {
        const allVoices = window.speechSynthesis.getVoices();
        voices = allVoices.filter(voice => 
          voice.lang.includes('zh') || voice.lang.includes('cmn')
        );
        
        // 如果没有中文语音，使用默认语音
        if (voices.length === 0) {
          console.warn('未找到中文语音，将使用默认语音');
          voices = allVoices;
        }
        
        voicesLoaded = true;
        console.log('已加载语音:', voices);
      } catch (e) {
        console.error('加载语音发生错误:', e);
        voicesLoaded = false;
      }
    };
    
    // Chrome需要等待onvoiceschanged事件
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // 立即尝试加载语音（Firefox等浏览器可能不触发onvoiceschanged）
    loadVoices();
  } catch (e) {
    console.error('初始化语音合成失败:', e);
    speechSynthesisSupported = false;
  }
}

// 生成发音URL
export const generatePronunciation = async (pinyin: string): Promise<string> => {
  try {
    // 简化处理，返回一个伪造的URL
    // 注意：这不是真实的发音URL，实际项目中应连接到真实的TTS服务
    return `#${encodeURIComponent(pinyin.toLowerCase())}`;
  } catch (error) {
    console.error('生成发音URL失败:', error);
    return '';
  }
};

// 使用Web Speech API播放发音
export const playPronunciation = (pinyin: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      console.error('非浏览器环境，无法播放语音');
      resolve(); // 在服务器端直接resolve
      return;
    }

    if (!speechSynthesisSupported) {
      console.error('Web Speech API不被此浏览器支持');
      reject(new Error('您的浏览器不支持语音合成功能'));
      return;
    }
    
    try {
      // 取消之前的所有语音
      window.speechSynthesis.cancel();
      
      console.log(`请求播放发音: ${pinyin}`);
      
      // 清理输入的拼音，移除特殊字符并规范化空格
      const cleanPinyin = pinyin
        .replace(/[^\w\s-]/gi, '') // 移除标点，但保留连字符和字母数字
        .replace(/Zi[a-f0-9]+/gi, '') // 移除通用拼音占位符
        .replace(/\s+/g, ' ')     // 替换多个空格为单个空格
        .trim();                  // 移除首尾空格
      
      console.log(`处理后的拼音: "${cleanPinyin}"`);
      
      // 如果清理后的拼音为空，尝试简单清理
      if (!cleanPinyin || cleanPinyin.length < 2) {
        const simpleCleaned = pinyin.replace(/[^\w\s]/gi, ' ').trim();
        if (simpleCleaned && simpleCleaned.length >= 2) {
          console.log(`使用简单清理的拼音: "${simpleCleaned}"`);
          // 递归调用自身，使用简单清理的结果
          return playPronunciation(simpleCleaned)
            .then(resolve)
            .catch(reject);
        } else {
          console.warn('清理后的拼音为空或太短，跳过播放');
          resolve();
          return;
        }
      }
      
      // 使用备用方法
      const playDirectly = () => {
        try {
          const msg = new SpeechSynthesisUtterance(cleanPinyin);
          msg.rate = 0.8;
          msg.volume = 1.0;
          
          // 尝试设置语音
          if (voices.length > 0) {
            const preferredVoice = voices[0];
            msg.voice = preferredVoice;
            console.log(`使用备用语音: ${preferredVoice.name}`);
          }
          
          msg.onend = () => {
            console.log('发音完成');
            resolve();
          };
          
          msg.onerror = (event) => {
            console.error('备用发音错误:', event);
            // 在错误时也resolve，避免卡住用户界面
            resolve();
          };
          
          window.speechSynthesis.speak(msg);
          
          // 5秒超时保护
          setTimeout(() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
              console.log('播放超时，强制停止');
              resolve();
            }
          }, 5000);
          
          return true;
        } catch (e) {
          console.error('备用播放方法失败:', e);
          return false;
        }
      };
      
      const utterance = new SpeechSynthesisUtterance(cleanPinyin);
      
      // 确保语音已加载
      const loadVoicesAndSpeak = () => {
        try {
          const allVoices = window.speechSynthesis.getVoices();
          if (allVoices.length > 0) {
            // 优先中文语音，然后是英文语音，最后是任何可用语音
            let selectedVoice = allVoices.find(v => v.lang === 'zh-CN' || v.lang === 'cmn-Hans-CN');
            
            if (!selectedVoice) {
              selectedVoice = allVoices.find(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
            }
            
            if (!selectedVoice) {
              selectedVoice = allVoices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
            }
            
            if (!selectedVoice && allVoices.length > 0) {
              selectedVoice = allVoices[0];
            }
            
            if (selectedVoice) {
              utterance.voice = selectedVoice;
              console.log(`使用语音: ${selectedVoice.name} (${selectedVoice.lang})`);
            } else {
              console.warn('未找到可用语音，将使用默认语音');
            }
            
            utterance.lang = 'zh-CN'; // 尝试强制中文语言
            utterance.rate = 0.8;     // 速度稍慢，更清晰
            utterance.pitch = 1.0;    // 标准音调
            utterance.volume = 1.0;   // 最大音量
            
            utterance.onend = () => {
              console.log('发音完成');
              resolve();
            };
            
            utterance.onerror = (event) => {
              console.error('发音错误:', event);
              // 尝试使用备用方法
              if (playDirectly()) {
                return;
              }
              reject(new Error(`发音失败: ${event.error || '未知错误'}`));
            };
            
            try {
              console.log(`开始播放语音: "${cleanPinyin}"`);
              window.speechSynthesis.speak(utterance);
              
              // 解决Chrome中的语音合成bug
              const fixChromeSpeechSynthesis = () => {
                if (speechSynthesisSupported && window.speechSynthesis.speaking) {
                  window.speechSynthesis.pause();
                  window.speechSynthesis.resume();
                  chromeBugTimer = setTimeout(fixChromeSpeechSynthesis, 500);
                }
              };
              
              let chromeBugTimer = setTimeout(fixChromeSpeechSynthesis, 500);
              
              // 设置超时保护
              setTimeout(() => {
                if (window.speechSynthesis.speaking) {
                  console.log('发音超时，强制停止');
                  window.speechSynthesis.cancel();
                  clearTimeout(chromeBugTimer);
                  resolve(); // 超时后视为成功完成
                }
              }, 5000); // 5秒超时
            } catch (e) {
              console.error('播放语音失败，尝试备用方法:', e);
              if (playDirectly()) {
                return;
              }
              throw e;
            }
            
          } else {
            // 如果没有语音可用，使用备用方法
            if (playDirectly()) {
              return;
            }
            
            // 如果备用方法也失败，则使用默认设置
            console.warn('没有语音可用，使用默认设置');
            utterance.lang = 'zh-CN';
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve(); // 忽略错误，将错误也视为成功
            
            try {
              window.speechSynthesis.speak(utterance);
            } catch (e) {
              console.error('默认语音方法也失败:', e);
            }
            resolve(); // 立即解析Promise，避免等待
          }
        } catch (e) {
          console.error('loadVoicesAndSpeak出错:', e);
          resolve(); // 出错时也resolve
        }
      };
      
      // 检查语音是否已加载
      try {
        if (window.speechSynthesis.getVoices().length > 0) {
          loadVoicesAndSpeak();
        } else {
          // 等待语音加载
          if (speechSynthesisSupported && window.speechSynthesis.onvoiceschanged !== undefined) {
            const voicesLoadedHandler = () => {
              window.speechSynthesis.onvoiceschanged = null; // 清除事件
              loadVoicesAndSpeak();
            };
            
            window.speechSynthesis.onvoiceschanged = voicesLoadedHandler;
            
            // 设置备份超时，防止onvoiceschanged不触发
            setTimeout(() => {
              if (window.speechSynthesis.onvoiceschanged === voicesLoadedHandler) {
                window.speechSynthesis.onvoiceschanged = null;
                console.warn('语音加载超时，使用当前可用语音');
                loadVoicesAndSpeak();
              }
            }, 2000);
          } else {
            // 直接尝试，不等待
            loadVoicesAndSpeak();
          }
        }
      } catch (e) {
        console.error('检查语音加载状态出错:', e);
        if (playDirectly()) {
          return;
        }
        resolve(); // 出错时也resolve
      }
      
    } catch (error) {
      console.error('播放发音失败:', error);
      // 即使发生错误也尝试备用方法
      try {
        const msg = new SpeechSynthesisUtterance(pinyin);
        msg.onend = () => resolve();
        msg.onerror = () => resolve();
        window.speechSynthesis.speak(msg);
        setTimeout(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
          resolve();
        }, 5000);
      } catch (e) {
        console.error('备用方法失败:', e);
        reject(error);
      }
    }
  });
};

// 为名字生成发音
export const generateNamePronunciation = async (name: GeneratedName): Promise<string> => {
  try {
    return await generatePronunciation(name.pinyin);
  } catch (error) {
    console.error('生成名字发音失败:', error);
    return '';
  }
}; 