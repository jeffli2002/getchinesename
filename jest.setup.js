// jest-dom 添加了自定义匹配器用于断言 DOM 状态
require('@testing-library/jest-dom');

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟 Web Speech API
global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  lang: '',
  rate: 1,
  pitch: 1,
}));

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
};

// 模拟元素的滚动行为
Element.prototype.scrollIntoView = jest.fn(); 