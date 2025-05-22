/**
 * @typedef {import('@/types').GeneratedName} GeneratedName
 */

// 生成发音URL
/**
 * @param {string} pinyin
 * @returns {Promise<string>}
 */
const generatePronunciation = async (pinyin) => {
  // 简化处理，返回模拟URL
  return `/audio/pronunciation-${encodeURIComponent(pinyin.toLowerCase())}.mp3`;
};

// 使用Web Speech API播放发音
/**
 * @param {string} pinyin
 */
const playPronunciation = (pinyin) => {
  // 模拟函数，不做任何操作
  console.log(`Playing pronunciation for: ${pinyin}`);
};

// 为名字生成发音
/**
 * @param {GeneratedName} name
 * @returns {Promise<string>}
 */
const generateNamePronunciation = async (name) => {
  return await generatePronunciation(name.pinyin);
};

module.exports = {
  generatePronunciation,
  playPronunciation,
  generateNamePronunciation
}; 