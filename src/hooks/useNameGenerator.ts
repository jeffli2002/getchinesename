import { useState } from 'react';
import { NameInput, GeneratedName } from '@/types';
import { generateNames } from '@/utils/nameGenerator';
import { generateCalligraphyAnimation } from '@/utils/calligraphy';
import { generateNamePronunciation } from '@/utils/pronunciation';

export const useNameGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = async (input: NameInput) => {
    try {
      // 重置状态
      setLoading(true);
      setError(null);
      
      // 验证输入
      if (!input.originalName || !input.gender) {
        throw new Error('Please fill in all required fields');
      }
      
      // 生成名字
      const generatedNames = await generateNames(input);
      
      // 为每个名字添加书法和发音
      const enhancedNames = await Promise.all(
        generatedNames.map(async (name) => {
          try {
            // 分别为每个字符生成书法笔画，然后组合
            const kaiStrokes = generateCalligraphyAnimation(name.fullName, 'kai');
            const xingStrokes = generateCalligraphyAnimation(name.fullName, 'xing');
            
            // 确保动画数据有效
            if (kaiStrokes.length === 0) {
              console.warn(`警告: "${name.fullName}"没有生成楷书笔画`);
            } else {
              console.log(`为名字"${name.fullName}"生成了${kaiStrokes.length}个楷书笔画`);
            }
            
            if (xingStrokes.length === 0) {
              console.warn(`警告: "${name.fullName}"没有生成行书笔画`);
            } else {
              console.log(`为名字"${name.fullName}"生成了${xingStrokes.length}个行书笔画`);
            }
            
            // 生成发音URL
            const pronunciation = await generateNamePronunciation(name);
            
            return {
              ...name,
              calligraphy: {
                kai: JSON.stringify(kaiStrokes), // 序列化笔画数据以便在组件中使用
                xing: JSON.stringify(xingStrokes)
              },
              pronunciation
            };
          } catch (error) {
            console.error(`增强名字"${name.fullName}"时出错:`, error);
            // 即使出错也返回原始名字，避免整个生成过程失败
            return {
              ...name,
              calligraphy: {
                kai: JSON.stringify([]), // 空笔画数据
                xing: JSON.stringify([])
              },
              pronunciation: ''
            };
          }
        })
      );
      
      console.log('生成的名字详情:', enhancedNames);
      setNames(enhancedNames);
      setHasGenerated(true);
    } catch (err) {
      console.error('名字生成错误:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setNames([]);
    setError(null);
    setHasGenerated(false);
  };

  return {
    loading,
    names,
    error,
    hasGenerated,
    generate,
    reset
  };
}; 