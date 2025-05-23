// 简化版语言存储模块 - 使用纯JavaScript
// 不使用React JSX语法和TypeScript，避免编译问题

/**
 * 创建简单的语言存储
 */
function createLanguageStore() {
  // 默认语言设置
  const defaultLanguage = 'en';
  
  // 可用语言列表
  const availableLanguages = ['en', 'zh', 'fr'];
  
  // 存储当前语言
  let currentLanguage = defaultLanguage;
  
  // 获取当前语言
  const getLanguage = function() {
    return currentLanguage;
  };
  
  // 设置语言
  const setLanguage = function(language) {
    if (availableLanguages.includes(language)) {
      currentLanguage = language;
      return true;
    }
    return false;
  };
  
  // 检查语言是否可用
  const isLanguageAvailable = function(language) {
    return availableLanguages.includes(language);
  };
  
  // 获取所有可用语言
  const getAllLanguages = function() {
    return availableLanguages;
  };
  
  // 返回语言存储对象
  return {
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    isLanguageAvailable: isLanguageAvailable,
    getAllLanguages: getAllLanguages,
    // 为了兼容现有代码，添加一些模拟属性
    language: defaultLanguage
  };
}

// 创建语言存储实例
const languageStore = createLanguageStore();

// 使用CommonJS导出以确保兼容性
module.exports = languageStore;