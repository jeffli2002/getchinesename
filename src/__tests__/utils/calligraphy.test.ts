const { generateCalligraphyAnimation, generateCharacterStrokes } = require('../../__tests__/mocks/calligraphy');

describe('书法生成功能测试', () => {
  describe('生成字符笔画测试', () => {
    it('应该为单个字符生成笔画数据', () => {
      // 测试楷书风格
      const kaiStrokes = generateCharacterStrokes('李', 'kai');
      
      expect(kaiStrokes).toBeDefined();
      expect(Array.isArray(kaiStrokes)).toBeTruthy();
      expect(kaiStrokes.length).toBeGreaterThan(0);
      
      // 检查每个笔画的属性
      kaiStrokes.forEach(stroke => {
        expect(stroke.path).toBeDefined();
        expect(stroke.duration).toBeDefined();
        expect(stroke.delay).toBeDefined();
      });
      
      // 测试行书风格
      const xingStrokes = generateCharacterStrokes('李', 'xing');
      
      expect(xingStrokes).toBeDefined();
      expect(Array.isArray(xingStrokes)).toBeTruthy();
      expect(xingStrokes.length).toBeGreaterThan(0);
    });
    
    it('应该为未定义的字符使用默认笔画', () => {
      const defaultStrokes = generateCharacterStrokes('测', 'kai');
      
      expect(defaultStrokes).toBeDefined();
      expect(Array.isArray(defaultStrokes)).toBeTruthy();
      expect(defaultStrokes.length).toBeGreaterThan(0);
    });
    
    it('笔画延迟应该按序递增', () => {
      const strokes = generateCharacterStrokes('王', 'kai');
      
      // 验证延迟是递增的
      for (let i = 1; i < strokes.length; i++) {
        expect(strokes[i].delay).toBeGreaterThan(strokes[i-1].delay);
      }
    });
  });
  
  describe('生成名字书法动画测试', () => {
    it('应该为完整名字生成书法动画', () => {
      const nameAnimation = generateCalligraphyAnimation('李明');
      
      expect(nameAnimation).toBeDefined();
      expect(Array.isArray(nameAnimation)).toBeTruthy();
      expect(nameAnimation.length).toBeGreaterThan(0);
    });
    
    it('生成的动画应包含所有字符的笔画', () => {
      // '王' 有4个笔画, '李' 有4个笔画（在我们的模拟数据中）
      // 所以 '王李' 应该有至少 8 个笔画
      const twoCharAnimation = generateCalligraphyAnimation('王李');
      
      expect(twoCharAnimation.length).toBeGreaterThanOrEqual(8);
      
      // 第二个字的笔画应该在第一个字的笔画之后开始
      // 找到 '王' 最后一个笔画的延迟
      const oneCharStrokes = generateCharacterStrokes('王', 'kai');
      const lastDelayOfFirstChar = oneCharStrokes[oneCharStrokes.length - 1].delay;
      
      // 找到整体动画中第二组笔画的第一个
      // 注意：这里假设第一个字有4个笔画
      const firstStrokeOfSecondChar = twoCharAnimation[4];
      
      // 第二个字的第一个笔画应该在第一个字的最后一个笔画之后
      expect(firstStrokeOfSecondChar.delay).toBeGreaterThan(lastDelayOfFirstChar);
    });
    
    it('应该支持楷书和行书两种风格', () => {
      const kaiAnimation = generateCalligraphyAnimation('张三', 'kai');
      const xingAnimation = generateCalligraphyAnimation('张三', 'xing');
      
      expect(kaiAnimation).toBeDefined();
      expect(xingAnimation).toBeDefined();
      
      // 验证两种风格的路径不同
      expect(kaiAnimation[0].path).not.toBe(xingAnimation[0].path);
    });
  });
}); 