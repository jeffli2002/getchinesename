import React, { ReactNode } from 'react';
const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');

// 模拟名字生成函数
jest.mock('../../utils/nameGenerator', () => ({
  generateNames: jest.fn().mockResolvedValue([
    {
      fullName: '李明',
      surname: '李',
      givenName: '明',
      pinyin: 'Li Ming',
      surnameMeaning: { en: 'Plum tree', fr: 'Prunier', zh: '李树' },
      givenNameMeaning: {
        en: 'Bright',
        fr: 'Lumineux',
        zh: '这个名字带有阳刚之气，木代表生长、创造和发展。'
      },
      calligraphy: { kai: '', xing: '' },
      pronunciation: ''
    }
  ])
}));

// 模拟hook实现
jest.mock('../../hooks/useNameGenerator', () => ({
  useNameGenerator: () => ({
    loading: false,
    names: [
      {
        fullName: '李明',
        surname: '李',
        givenName: '明',
        pinyin: 'Li Ming',
        surnameMeaning: { en: 'Plum tree', fr: 'Prunier', zh: '李树' },
        givenNameMeaning: {
          en: 'Bright',
          fr: 'Lumineux',
          zh: '这个名字带有阳刚之气，木代表生长、创造和发展。'
        },
        calligraphy: { kai: '', xing: '' },
        pronunciation: ''
      }
    ],
    error: null,
    hasGenerated: true,
    generate: jest.fn().mockImplementation((formData) => {
      // 实际执行时调用generateNames函数
      const { generateNames } = require('../../utils/nameGenerator');
      generateNames(formData);
      return Promise.resolve();
    })
  })
}));

// 模拟语言存储
jest.mock('../../store', () => ({
  useLanguageStore: () => ({
    language: 'en'
  })
}));

// 模拟CalligraphyAnimation组件
jest.mock('../../components/common/CalligraphyAnimation', () => {
  return function MockCalligraphyAnimation() {
    return <div data-testid="calligraphy-animation"></div>;
  };
});

// 引入被测试组件
const NameGenerator = require('../../components/sections/NameGenerator').default;
const { generateNames } = require('../../utils/nameGenerator');

describe('NameGenerator 组件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置DOM
    document.body.innerHTML = '';
  });

  it('应该渲染名字生成表单', () => {
    render(<NameGenerator />);
    
    // 验证表单元素存在
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Birth Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Profession')).toBeInTheDocument();
  });

  it('提交表单后应该调用名字生成API', async () => {
    const { container } = render(<NameGenerator />);
    
    // 找到表单元素
    const form = container.querySelector('form');
    const nameInput = screen.getByLabelText('Your Name');
    const genderSelect = screen.getByLabelText('Gender');
    const dateInput = screen.getByLabelText('Birth Date');
    const professionSelect = screen.getByLabelText('Profession');
    
    // 填写表单
    fireEvent.change(nameInput, { target: { value: 'Smith' } });
    fireEvent.change(genderSelect, { target: { value: 'male' } });
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });
    fireEvent.change(professionSelect, { target: { value: 'Engineer' } });
    
    // 提交表单
    fireEvent.submit(form);
    
    // 验证API调用
    await waitFor(() => {
      expect(generateNames).toHaveBeenCalledWith({
        originalName: 'Smith',
        gender: 'male',
        birthDate: '1990-01-01',
        profession: 'Engineer'
      });
    });
  });

  it('应该显示生成的名字结果', async () => {
    render(<NameGenerator />);
    
    // 验证结果显示
    expect(screen.getByText('李明')).toBeInTheDocument();
    expect(screen.getByText('Li Ming')).toBeInTheDocument();
  });
}); 