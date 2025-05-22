import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stroke } from '@/utils/calligraphy';
import Script from 'next/script';

interface CalligraphyAnimationProps {
  strokes: string; // 不再使用，保留以兼容现有代码
  style: 'kai' | 'xing';
  autoPlay?: boolean;
  onComplete?: () => void;
  character?: string; // 要绘制的汉字
  debug?: boolean;
}

const CalligraphyAnimation: React.FC<CalligraphyAnimationProps> = ({
  strokes,
  style,
  autoPlay = false,
  onComplete,
  character,
  debug = false
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fallbackToStatic, setFallbackToStatic] = useState(false);
  
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 楷书和行书的样式区别
  const styleConfig = {
    kai: {
      strokeColor: '#000',
      strokeWidth: 8,
      background: 'linear-gradient(to bottom, #fffaf0, #fff8e8)',
      label: '楷书',
      fontClass: 'font-kai'
    },
    xing: {
      strokeColor: '#333',
      strokeWidth: 6,
      background: 'linear-gradient(to bottom, #f0f5ff, #e8f0ff)',
      label: '行书',
      fontClass: 'font-xing'
    }
  };
  
  const currentStyle = styleConfig[style];

  // 处理HanziWriter脚本加载
  const handleScriptLoad = () => {
    setScriptLoaded(true);
    if (debug) {
      console.log('HanziWriter库已加载');
    }
  };

  // 处理脚本加载失败
  const handleScriptError = () => {
    console.error('HanziWriter脚本加载失败');
    setFallbackToStatic(true);
  };

  // 加载HanziWriter实例
  useEffect(() => {
    if (!character || !scriptLoaded || !targetRef.current) return;
    
    // 设置加载超时，15秒后如果还未加载完成则使用静态显示
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!isLoaded && !error) {
        console.warn('HanziWriter加载超时，切换到静态显示');
        setFallbackToStatic(true);
      }
    }, 15000);
    
    try {
      if (debug) {
        console.log(`初始化HanziWriter(${style}): ${character}`);
      }
      
      // 清除之前的实例
      if (writerRef.current) {
        writerRef.current = null;
      }
      
      // 清空目标容器
      if (targetRef.current) {
        targetRef.current.innerHTML = '';
      }

      // 确保HanziWriter已加载
      if (!window.HanziWriter) {
        console.warn('HanziWriter库未加载，等待加载完成');
        // 5秒后尝试重新加载
        setTimeout(() => {
          setLoadAttempt(prev => prev + 1);
        }, 5000);
        return;
      }

      setIsLoaded(false);
      setError(null);

      // 创建新的HanziWriter实例
      const options = {
        width: 100,
        height: 100,
        padding: 5,
        strokeColor: currentStyle.strokeColor,
        strokeWidth: currentStyle.strokeWidth,
        outlineColor: '#ddd',
        radicalColor: style === 'kai' ? '#164fc7' : '#b80000', // 偏旁部首颜色
        delayBetweenStrokes: 300,
        strokeAnimationSpeed: style === 'kai' ? 1 : 1.2, // 行书略快
        charDataLoader: function(char: string, onComplete: (data: any) => void) {
          // 尝试多个CDN源
          const urls = [
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${char}.json`,
            `https://fastly.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${char}.json`,
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${char}.json`
          ];
          
          // 按顺序尝试不同的URL
          const tryNextUrl = (index: number) => {
            if (index >= urls.length) {
              console.error(`所有CDN源都无法加载"${char}"的笔画数据`);
              setFallbackToStatic(true);
              return;
            }
            
            fetch(urls[index], { 
              // 添加缓存控制和请求超时
              cache: 'force-cache',
              signal: AbortSignal.timeout(5000) // 5秒超时
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                if (data && data.strokes && Array.isArray(data.strokes)) {
                  onComplete(data);
                } else {
                  throw new Error('无效的汉字数据格式');
                }
              })
              .catch(error => {
                console.warn(`从${urls[index]}加载失败:`, error);
                // 尝试下一个URL
                tryNextUrl(index + 1);
              });
          };
          
          // 开始尝试第一个URL
          tryNextUrl(0);
        },
        onLoadCharDataSuccess: () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setIsLoaded(true);
          setError(null);
        },
        onLoadCharDataError: (reason: any) => {
          console.error('加载汉字数据失败:', reason);
          setFallbackToStatic(true);
        }
      };
      
      try {
        const writer = window.HanziWriter.create(targetRef.current, character, options);
        writerRef.current = writer;
        
        // 如果设置了自动播放，等加载完成后开始动画
        if (autoPlay) {
          const checkAndPlay = () => {
            if (isLoaded) {
              setTimeout(() => {
                if (writerRef.current) {
                  try {
                    writerRef.current.animateCharacter({
                      onComplete: () => {
                        setIsComplete(true);
                        if (onComplete) onComplete();
                      }
                    });
                  } catch (e) {
                    console.error('自动播放动画失败:', e);
                  }
                }
              }, 500);
            } else {
              // 每100ms检查一次是否加载完成，最多检查50次(5秒)
              const checkCount = { count: 0 };
              const intervalId = setInterval(() => {
                if (isLoaded || checkCount.count > 50) {
                  clearInterval(intervalId);
                  if (isLoaded && writerRef.current) {
                    try {
                      writerRef.current.animateCharacter({
                        onComplete: () => {
                          setIsComplete(true);
                          if (onComplete) onComplete();
                        }
                      });
                    } catch (e) {
                      console.error('自动播放动画失败:', e);
                    }
                  } else if (checkCount.count > 50) {
                    setFallbackToStatic(true);
                  }
                }
                checkCount.count++;
              }, 100);
            }
          };
          
          checkAndPlay();
        }
      } catch (err) {
        console.error('创建HanziWriter实例失败:', err);
        setFallbackToStatic(true);
      }
    } catch (err) {
      console.error('初始化HanziWriter失败:', err);
      setFallbackToStatic(true);
    }
    
    return () => {
      // 清理超时
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // 清理函数
      if (writerRef.current) {
        try {
          // 尝试清理HanziWriter实例
          writerRef.current = null;
        } catch (e) {
          console.error('清理HanziWriter失败:', e);
        }
      }
    };
  }, [character, style, scriptLoaded, autoPlay, loadAttempt]);

  // 播放或暂停动画
  const togglePlay = () => {
    if (!writerRef.current || !isLoaded || fallbackToStatic) return;
    
    try {
      if (isComplete) {
        // 重播动画
        writerRef.current.animateCharacter({
          onComplete: () => {
            setIsComplete(true);
            if (onComplete) onComplete();
          }
        });
        setIsComplete(false);
        setIsPlaying(true);
      } else if (isPlaying) {
        // 暂停动画 - HanziWriter 2.2版本只能取消动画
        try {
          if (typeof writerRef.current.cancelAnimation === 'function') {
            writerRef.current.cancelAnimation();
          }
        } catch (e) {
          console.error('取消动画失败:', e);
        }
        setIsPlaying(false);
      } else {
        // 开始新动画
        writerRef.current.animateCharacter({
          onComplete: () => {
            setIsComplete(true);
            if (onComplete) onComplete();
          }
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('操作HanziWriter实例失败:', error);
      setFallbackToStatic(true);
    }
  };

  // 渲染静态文字 - 用于回退或错误显示
  const renderStaticCharacter = () => (
    <div className="relative h-full w-full border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
      <div className="text-center p-4">
        {character && (
          <div className={`text-4xl font-bold ${style === 'kai' ? 'font-kai' : 'font-xing'}`}
               style={style === 'xing' ? { fontStyle: 'italic', transform: 'skewX(-5deg)' } : undefined}>
            {character}
          </div>
        )}
        <div className="text-gray-500 text-xs mt-2">
          {style === 'kai' ? '楷书' : '行书'}
        </div>
      </div>
    </div>
  );
  
  // 如果需要显示静态文字（回退模式或出错）
  if (fallbackToStatic || (!isLoaded && loadAttempt > 1)) {
    return renderStaticCharacter();
  }
  
  // 如果出错或字符为空
  if (error || !character) {
    return renderStaticCharacter();
  }
  
  return (
    <>
      <Script 
        src="https://unpkg.com/hanzi-writer@2.2.2/dist/hanzi-writer.min.js"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />
      
      <div 
        className="relative h-full w-full border rounded-md overflow-hidden"
        style={{ background: currentStyle.background }}
      >
        {/* 当前样式标签 */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-0.5 rounded text-xs text-gray-500 shadow-sm">
          {currentStyle.label}
        </div>
        
        {/* 调试信息 */}
        {debug && (
          <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-70 px-2 py-0.5 rounded text-xs text-gray-500 shadow-sm">
            {isLoaded ? '汉字绘制库已加载' : '汉字绘制库加载中...'}
          </div>
        )}
        
        {/* 加载指示器 */}
        {!isLoaded && !fallbackToStatic && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              <div className="text-sm text-gray-600 mt-2">正在加载...</div>
            </div>
          </div>
        )}
        
        {/* 书法画布 */}
        <div 
          className={`h-full w-full flex items-center justify-center ${currentStyle.fontClass}`}
          onClick={togglePlay}
        >
          <div 
            ref={targetRef} 
            className="h-4/5 w-4/5 max-h-full max-w-full"
            style={style === 'xing' ? { transform: 'skewX(-10deg)' } : undefined}
          />
          
          {/* 如果加载失败，显示静态字符 */}
          {fallbackToStatic && character && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ pointerEvents: 'none' }}
            >
              <div className={`text-5xl font-bold ${style === 'kai' ? 'font-kai' : 'font-xing'}`}
                   style={style === 'xing' ? { fontStyle: 'italic', transform: 'skewX(-5deg)' } : undefined}>
                {character}
              </div>
            </div>
          )}
        </div>
        
        {/* 播放控制按钮 - 只在非静态模式下显示 */}
        {!fallbackToStatic && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="bg-white bg-opacity-70 p-1 rounded-full shadow-sm"
              disabled={!isLoaded}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isComplete ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// 添加全局类型定义，使TypeScript识别HanziWriter
declare global {
  interface Window {
    HanziWriter: any;
  }
}

export default CalligraphyAnimation; 