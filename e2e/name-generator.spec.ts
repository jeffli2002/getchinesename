import { test, expect } from '@playwright/test';

test.describe('名字生成器功能测试', () => {
  test('应该正确加载名字生成器表单', async ({ page }) => {
    // 访问主页
    await page.goto('/');
    
    // 定位到名字生成器部分
    const nameGenerator = page.locator('#name-generator');
    await expect(nameGenerator).toBeVisible();
    
    // 验证表单元素
    await expect(nameGenerator.locator('#originalName')).toBeVisible();
    await expect(nameGenerator.locator('#birthDate')).toBeVisible();
    await expect(nameGenerator.locator('#gender')).toBeVisible();
    await expect(nameGenerator.locator('#profession')).toBeVisible();
    
    // 验证生成按钮
    await expect(nameGenerator.getByRole('button', { name: /Generate Names|Générer des Noms/ })).toBeVisible();
  });
  
  test('应该可以填写表单并生成中文名字', async ({ page }) => {
    // 访问主页
    await page.goto('/');
    
    // 定位到名字生成器部分
    const nameGenerator = page.locator('#name-generator');
    
    // 填写表单
    await nameGenerator.locator('#originalName').fill('John Smith');
    await nameGenerator.locator('#birthDate').fill('1990-01-01');
    await nameGenerator.locator('#gender').selectOption('male');
    await nameGenerator.locator('#profession').fill('Engineer');
    
    // 点击生成按钮
    await nameGenerator.getByRole('button', { name: /Generate Names|Générer des Noms/ }).click();
    
    // 等待加载完成
    await page.waitForSelector('h3:has-text("Your Chinese Names"), h3:has-text("Vos Noms Chinois")', { 
      state: 'visible', 
      timeout: 15000 
    });
    
    // 验证生成的名字结果区域显示
    const resultsSection = page.locator('h3').filter({ hasText: /Your Chinese Names|Vos Noms Chinois/ }).locator('xpath=../..');
    await expect(resultsSection).toBeVisible();
    
    // 验证生成了名字选项
    const nameCards = page.locator('.bg-white.rounded-lg.shadow-lg.overflow-hidden');
    await expect(nameCards.first()).toBeVisible({ timeout: 10000 });
    
    // 验证名字卡片包含必要的元素
    const firstCard = nameCards.first();
    
    // 中文名字显示
    await expect(firstCard.locator('h4')).toBeVisible();
    
    // 拼音显示
    await expect(firstCard.locator('p.text-sm.text-gray-500')).toBeVisible();
    
    // 书法动画区域
    await expect(firstCard.locator('.mt-4.h-40')).toBeVisible();
    
    // 发音按钮
    await expect(firstCard.getByTitle(/Play pronunciation/)).toBeVisible();
  });
  
  test('应该可以切换书法风格', async ({ page }) => {
    // 访问主页
    await page.goto('/');
    
    // 定位到名字生成器部分
    const nameGenerator = page.locator('#name-generator');
    
    // 填写表单并生成名字
    await nameGenerator.locator('#originalName').fill('Jane Doe');
    await nameGenerator.locator('#birthDate').fill('1992-05-15');
    await nameGenerator.locator('#gender').selectOption('female');
    await nameGenerator.locator('#profession').fill('Doctor');
    
    // 点击生成按钮
    await nameGenerator.getByRole('button', { name: /Generate Names|Générer des Noms/ }).click();
    
    // 等待加载完成
    await page.waitForSelector('h3:has-text("Your Chinese Names"), h3:has-text("Vos Noms Chinois")', { 
      state: 'visible', 
      timeout: 15000 
    });
    
    // 验证书法风格切换按钮组
    const styleToggle = page.locator('.flex.border-b');
    await expect(styleToggle).toBeVisible();
    
    // 验证默认选中楷书和行书按钮
    const kaiButton = styleToggle.getByText(/Regular Script|Écriture Régulière/);
    const xingButton = styleToggle.getByText(/Running Script|Écriture Cursive/);
    
    await expect(kaiButton).toBeVisible();
    await expect(xingButton).toBeVisible();
    
    // 验证楷书按钮默认选中状态
    await expect(kaiButton).toHaveClass(/border-indigo-500/);
    
    // 点击切换到行书
    await xingButton.click();
    
    // 验证行书被选中
    await expect(xingButton).toHaveClass(/border-indigo-500/);
  });
  
  test('应该可以播放名字发音', async ({ page }) => {
    // 访问主页
    await page.goto('/');
    
    // 定位到名字生成器部分
    const nameGenerator = page.locator('#name-generator');
    
    // 填写表单并生成名字
    await nameGenerator.locator('#originalName').fill('Robert Johnson');
    await nameGenerator.locator('#birthDate').fill('1985-11-23');
    await nameGenerator.locator('#gender').selectOption('male');
    await nameGenerator.locator('#profession').fill('Teacher');
    
    // 点击生成按钮
    await nameGenerator.getByRole('button', { name: /Generate Names|Générer des Noms/ }).click();
    
    // 等待加载完成
    await page.waitForSelector('h3:has-text("Your Chinese Names"), h3:has-text("Vos Noms Chinois")', { 
      state: 'visible', 
      timeout: 15000 
    });
    
    // 定位发音按钮
    const pronunciationButton = page.locator('.bg-white.rounded-lg.shadow-lg.overflow-hidden').first().getByTitle(/Play pronunciation/);
    await expect(pronunciationButton).toBeVisible();
    
    // 点击发音按钮 - 注意：这可能在测试环境中不会实际播放声音
    await pronunciationButton.click();
    
    // 我们不验证播放状态，因为Web Speech API可能在测试环境中不工作
  });
}); 