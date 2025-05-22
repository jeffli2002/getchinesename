// 定义笔画类型
/**
 * @typedef {Object} Stroke
 * @property {string} path
 * @property {number} duration
 * @property {number} delay
 */

// 生成字符的笔画动画数据
/**
 * @param {string} char
 * @param {'kai' | 'xing'} style
 * @param {number} baseDelay
 * @param {number} strokeDuration
 * @returns {Stroke[]}
 */
const generateCharacterStrokes = (
  char,
  style,
  baseDelay = 0,
  strokeDuration = 0.5
) => {
  // 返回模拟数据
  if (style === 'kai') {
    return [
      { path: 'M 10,50 L 90,50', duration: strokeDuration, delay: baseDelay },
      { path: 'M 50,10 L 50,90', duration: strokeDuration, delay: baseDelay + strokeDuration * 0.8 },
      { path: 'M 70,20 L 30,80', duration: strokeDuration, delay: baseDelay + strokeDuration * 1.6 },
      { path: 'M 30,20 L 70,80', duration: strokeDuration, delay: baseDelay + strokeDuration * 2.4 }
    ];
  } else {
    return [
      { path: 'M 10,50 C 30,45 70,55 90,50', duration: strokeDuration, delay: baseDelay },
      { path: 'M 50,10 C 55,30 45,70 50,90', duration: strokeDuration, delay: baseDelay + strokeDuration * 0.8 },
      { path: 'M 70,20 C 60,40 40,60 30,80', duration: strokeDuration, delay: baseDelay + strokeDuration * 1.6 },
      { path: 'M 30,20 C 40,40 60,60 70,80', duration: strokeDuration, delay: baseDelay + strokeDuration * 2.4 }
    ];
  }
};

// 为整个名字生成书法动画
/**
 * @param {string} name
 * @param {'kai' | 'xing'} style
 * @param {number} charDuration
 * @returns {Stroke[]}
 */
const generateCalligraphyAnimation = (
  name,
  style = 'kai',
  charDuration = 2.5
) => {
  let allStrokes = [];
  let currentDelay = 0;
  
  // 为名字中的每个字符生成笔画
  for (let i = 0; i < name.length; i++) {
    const charStrokes = generateCharacterStrokes(name.charAt(i), style, currentDelay);
    allStrokes = [...allStrokes, ...charStrokes];
    
    // 更新下一个字的延迟时间
    if (charStrokes.length > 0) {
      const lastStroke = charStrokes[charStrokes.length - 1];
      currentDelay = lastStroke.delay + lastStroke.duration + 0.5;
    } else {
      currentDelay += charDuration;
    }
  }
  
  return allStrokes;
};

module.exports = {
  generateCharacterStrokes,
  generateCalligraphyAnimation
}; 