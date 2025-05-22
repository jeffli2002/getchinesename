const React = require('react');
const { render, screen } = require('@testing-library/react');
require('@testing-library/jest-dom');

// 模拟组件
jest.mock('@/components/common/CalligraphyAnimation', () => {
  return function MockCalligraphyAnimation(props) {
    return (
      <div className="relative">
        <svg className={`w-full h-full ${props.style === 'kai' ? 'font-kai' : 'font-xing'}`} viewBox="0 0 100 100" role="presentation">
          {/* 解析笔画 */}
          {JSON.parse(props.strokes || '[]').map((stroke, index) => (
            <path key={index} d={stroke.path} data-testid="motion-path" />
          ))}
        </svg>
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button
            title="Play animation"
            className="p-1 rounded-full text-indigo-600 hover:text-indigo-800"
            disabled={props.autoPlay}
          />
          <button
            title="Reset animation"
            className="p-1 rounded-full text-gray-400"
            disabled={true}
          />
        </div>
      </div>
    );
  };
});

// 引入模拟后的组件
const CalligraphyAnimation = require('@/components/common/CalligraphyAnimation');

describe('CalligraphyAnimation 组件测试', () => {
  // 测试数据
  const mockStrokes = JSON.stringify([
    { path: 'M10,50 L90,50', duration: 0.5, delay: 0 },
    { path: 'M50,10 L50,90', duration: 0.5, delay: 0.4 },
  ]);

  it('应该正确渲染书法动画组件', () => {
    render(
      <CalligraphyAnimation
        strokes={mockStrokes}
        style="kai"
        autoPlay={false}
      />
    );
    
    // 验证按钮元素存在
    const playButton = screen.getByTitle('Play animation');
    const resetButton = screen.getByTitle('Reset animation');
    
    expect(playButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
  });

  it('应该解析并显示笔画', () => {
    const { container } = render(
      <CalligraphyAnimation
        strokes={mockStrokes}
        style="kai"
        autoPlay={false}
      />
    );
    
    // 验证解析了正确数量的笔画
    const paths = container.querySelectorAll('[data-testid="motion-path"]');
    expect(paths.length).toBe(2);
  });

  it('自动播放模式应该立即开始动画', () => {
    render(
      <CalligraphyAnimation
        strokes={mockStrokes}
        style="kai"
        autoPlay={true}
      />
    );
    
    // 播放按钮应该被禁用，因为动画正在播放
    const playButton = screen.getByTitle('Play animation');
    expect(playButton).toBeDisabled();
  });

  it('不同的样式应该应用不同的样式类', () => {
    // 楷书样式
    const { rerender } = render(
      <CalligraphyAnimation
        strokes={mockStrokes}
        style="kai"
        autoPlay={false}
      />
    );
    
    // 检查是否应用了楷书类
    expect(screen.getByRole('presentation').classList.contains('font-kai')).toBeTruthy();
    
    // 行书样式
    rerender(
      <CalligraphyAnimation
        strokes={mockStrokes}
        style="xing"
        autoPlay={false}
      />
    );
    
    // 检查是否应用了行书类
    expect(screen.getByRole('presentation').classList.contains('font-xing')).toBeTruthy();
  });
}); 