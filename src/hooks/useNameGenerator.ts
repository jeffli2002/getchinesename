import { useState } from 'react';
import { NameInput, GeneratedName } from '@/types';
import { generateNames } from '@/utils/nameGenerator';
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
      
      // 为每个名字添加发音
      const enhancedNames = await Promise.all(
        generatedNames.map(async (name) => {
          try {
            // 生成发音URL
            const pronunciation = await generateNamePronunciation(name);
            
            return {
              ...name,
              pronunciation
            };
          } catch (error) {
            console.error(`增强名字"${name.fullName}"时出错:`, error);
            // 即使出错也返回原始名字，避免整个生成过程失败
            return {
              ...name,
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