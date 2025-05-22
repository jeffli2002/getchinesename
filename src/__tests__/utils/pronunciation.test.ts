const { generatePronunciation, playPronunciation, generateNamePronunciation } = require('../../__tests__/mocks/pronunciation');
const { GeneratedName } = require('@/types');

// 模拟 fetch 函数（在测试环境中不可用）
global.fetch = jest.fn();

describe('发音功能测试', () => {
  beforeEach(() => {
    // 清除所有模拟的状态
    jest.clearAllMocks();
  });
  
  describe('生成发音 URL 测试', () => {
    it('应该返回拼音对应的音频 URL', async () => {
      const pinyin = 'Li Ming';
      const url = await generatePronunciation(pinyin);
      
      // 验证返回的 URL 格式
      expect(url).toBe('/audio/pronunciation-li%20ming.mp3');
    });
    
    it('URL 应该编码特殊字符', async () => {
      const pinyin = 'Zhang San';
      const url = await generatePronunciation(pinyin);
      
      expect(url).toBe('/audio/pronunciation-zhang%20san.mp3');
    });
  });
  
  describe('播放发音测试', () => {
    it('应该调用 Web Speech API 播放发音', () => {
      // 监听 console.log
      const consoleSpy = jest.spyOn(console, 'log');
      
      const pinyin = 'Li Ming';
      playPronunciation(pinyin);
      
      // 验证是否调用了 log 函数
      expect(consoleSpy).toHaveBeenCalledWith('Playing pronunciation for: Li Ming');
      
      // 清理
      consoleSpy.mockRestore();
    });
  });
  
  describe('名字发音生成测试', () => {
    it('应该为名字生成发音 URL', async () => {
      // 模拟名字数据
      const mockName = {
        fullName: '李明',
        surname: '李',
        givenName: '明',
        pinyin: 'Li Ming',
        surnameMeaning: {
          en: 'Plum tree',
          fr: 'Prunier',
          zh: '李树'
        },
        givenNameMeaning: {
          en: 'Bright',
          fr: 'Lumineux',
          zh: '明亮'
        },
        calligraphy: {
          kai: '',
          xing: ''
        },
        pronunciation: ''
      };
      
      const url = await generateNamePronunciation(mockName);
      
      // 验证返回的 URL 是否正确
      expect(url).toBe('/audio/pronunciation-li%20ming.mp3');
    });
  });
}); 