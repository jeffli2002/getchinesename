// 定义笔画类型
export interface Stroke {
  path: string;
  duration: number;
  delay: number;
}

// 增强的笔画数据库 - 更真实的楷书和行书区别
const enhancedStrokes = {
  // 横
  horizontal: {
    // 楷书：直线、方正
    kai: 'M 10,50 L 90,50',
    // 行书：弧线、流畅、两端微翘
    xing: 'M 10,52 C 30,48 70,48 90,52'
  },
  // 竖
  vertical: {
    // 楷书：笔直下垂
    kai: 'M 50,10 L 50,90',
    // 行书：微弯曲，上窄下宽
    xing: 'M 48,10 C 52,30 54,70 50,90'
  },
  // 撇
  leftFalling: {
    // 楷书：均匀下落
    kai: 'M 70,20 L 30,80',
    // 行书：飘逸，先快后慢
    xing: 'M 70,20 C 60,30 45,50 30,80'
  },
  // 捺
  rightFalling: {
    // 楷书：有力下按
    kai: 'M 30,20 L 70,80',
    // 行书：起笔缓和，收笔有力
    xing: 'M 30,20 C 35,35 50,60 70,80'
  },
  // 点
  dot: {
    // 楷书：方形点
    kai: 'M 48,40 L 55,47',
    // 行书：飘逸点
    xing: 'M 48,40 Q 50,42 55,47'
  },
  // 提
  upward: {
    // 楷书：直线向上
    kai: 'M 40,60 L 60,40',
    // 行书：曲线上扬
    xing: 'M 40,60 Q 50,50 60,40'
  },
  // 横折
  horizontalBreak: {
    // 楷书：直角转折
    kai: 'M 10,50 L 50,50 L 50,90',
    // 行书：弧形转折
    xing: 'M 10,50 Q 40,48 50,50 T 50,90'
  },
  // 竖钩
  verticalHook: {
    // 楷书：直角钩
    kai: 'M 50,10 L 50,80 L 60,90',
    // 行书：弧形钩
    xing: 'M 50,10 C 52,40 48,70 50,80 Q 52,85 60,90'
  }
};

// 常用姓氏的笔画数据 - 更全面的笔画组合
const surnameStrokes: Record<string, {kai: string[], xing: string[]}> = {
  '李': {
    kai: [
      'M 20,30 L 80,30', // 横
      'M 50,30 L 50,85', // 竖
      'M 35,50 L 65,50', // 横
      'M 35,50 L 35,70', // 竖
      'M 65,50 L 65,70', // 竖
      'M 30,70 L 70,70', // 横
      'M 40,85 L 60,85'  // 横
    ],
    xing: [
      'M 20,30 C 40,28 60,28 80,30', // 横（弯曲）
      'M 50,30 C 52,50 48,70 50,85', // 竖（微曲）
      'M 35,50 C 45,48 55,48 65,50', // 横（弯曲）
      'M 35,50 C 36,56 34,64 35,70', // 竖（微曲）
      'M 65,50 C 66,56 64,64 65,70', // 竖（微曲）
      'M 30,70 C 43,68 57,68 70,70', // 横（弯曲）
      'M 40,85 C 46,83 54,83 60,85'  // 横（弯曲）
    ]
  },
  '王': {
    kai: [
      'M 20,30 L 80,30', // 顶横
      'M 20,50 L 80,50', // 中横
      'M 20,70 L 80,70', // 底横
      'M 50,30 L 50,90'  // 中竖
    ],
    xing: [
      'M 20,30 C 40,28 60,28 80,30', // 顶横（弯曲）
      'M 20,50 C 40,48 60,48 80,50', // 中横（弯曲）
      'M 20,70 C 40,68 60,68 80,70', // 底横（弯曲）
      'M 50,30 C 52,50 48,70 50,90'  // 中竖（微曲）
    ]
  },
  '张': {
    kai: [
      'M 20,30 L 80,30', // 顶横
      'M 50,30 L 50,50', // 短竖
      'M 30,50 L 70,50', // 中横
      'M 30,50 L 30,90', // 左竖
      'M 70,50 L 70,90', // 右竖
      'M 30,70 L 70,70'  // 腰横
    ],
    xing: [
      'M 20,30 C 40,28 60,28 80,30', // 顶横（弯曲）
      'M 50,30 C 51,37 49,43 50,50', // 短竖（微曲）
      'M 30,50 C 43,48 57,48 70,50', // 中横（弯曲）
      'M 30,50 C 31,65 29,75 30,90', // 左竖（微曲）
      'M 70,50 C 71,65 69,75 70,90', // 右竖（微曲）
      'M 30,70 C 43,68 57,68 70,70'  // 腰横（弯曲）
    ]
  },
  '陈': {
    kai: [
      'M 20,20 L 40,20', // 左上横
      'M 60,20 L 80,20', // 右上横
      'M 30,20 L 30,40', // 左上竖
      'M 70,20 L 70,40', // 右上竖
      'M 20,40 L 80,40', // 横
      'M 50,40 L 50,90', // 中竖
      'M 30,60 L 70,60', // 中横
      'M 30,80 L 70,80'  // 底横
    ],
    xing: [
      'M 20,20 C 27,19 33,19 40,20', // 左上横（弯曲）
      'M 60,20 C 67,19 73,19 80,20', // 右上横（弯曲）
      'M 30,20 C 31,27 29,33 30,40', // 左上竖（微曲）
      'M 70,20 C 71,27 69,33 70,40', // 右上竖（微曲）
      'M 20,40 C 40,38 60,38 80,40', // 横（弯曲）
      'M 50,40 C 52,60 48,75 50,90', // 中竖（微曲）
      'M 30,60 C 43,58 57,58 70,60', // 中横（弯曲）
      'M 30,80 C 43,78 57,78 70,80'  // 底横（弯曲）
    ]
  },
  '黄': {
    kai: [
      'M 20,20 L 80,20', // 顶横
      'M 30,35 L 70,35', // 上横
      'M 35,20 L 35,50', // 左上竖
      'M 65,20 L 65,50', // 右上竖
      'M 25,50 L 75,50', // 中横
      'M 40,50 L 40,80', // 左中竖
      'M 60,50 L 60,80', // 右中竖
      'M 30,80 L 70,80'  // 底横
    ],
    xing: [
      'M 20,20 C 40,18 60,18 80,20', // 顶横（弯曲）
      'M 30,35 C 43,33 57,33 70,35', // 上横（弯曲）
      'M 35,20 C 36,30 34,40 35,50', // 左上竖（微曲）
      'M 65,20 C 66,30 64,40 65,50', // 右上竖（微曲）
      'M 25,50 C 42,48 58,48 75,50', // 中横（弯曲）
      'M 40,50 C 41,60 39,70 40,80', // 左中竖（微曲）
      'M 60,50 C 61,60 59,70 60,80', // 右中竖（微曲） 
      'M 30,80 C 43,78 57,78 70,80'  // 底横（弯曲）
    ]
  },
  // 默认笔画（用于未定义的姓氏）
  'default': {
    kai: [
      enhancedStrokes.horizontal.kai,
      enhancedStrokes.vertical.kai,
      enhancedStrokes.leftFalling.kai,
      enhancedStrokes.rightFalling.kai
    ],
    xing: [
      enhancedStrokes.horizontal.xing,
      enhancedStrokes.vertical.xing,
      enhancedStrokes.leftFalling.xing,
      enhancedStrokes.rightFalling.xing
    ]
  }
};

// 常用名字组合的笔画数据
const givenNameStrokes: Record<string, {kai: string[], xing: string[]}> = {
  '明': {
    kai: [
      'M 20,30 L 80,30', // 上横
      'M 50,30 L 50,70', // 中竖
      'M 30,50 L 70,50', // 中横
      'M 25,70 L 75,70'  // 下横
    ],
    xing: [
      'M 20,30 C 40,28 60,28 80,30', // 上横（弯曲）
      'M 50,30 C 52,45 48,55 50,70', // 中竖（微曲）
      'M 30,50 C 43,48 57,48 70,50', // 中横（弯曲）
      'M 25,70 C 42,68 58,68 75,70'  // 下横（弯曲）
    ]
  },
  '华': {
    kai: [
      'M 30,20 L 70,20', // 顶横
      'M 50,20 L 50,40', // 上竖
      'M 30,40 L 70,40', // 中横
      'M 35,40 L 20,70', // 左撇
      'M 65,40 L 80,70', // 右捺
      'M 40,60 L 60,60', // 底横
      'M 50,40 L 50,80'  // 下竖
    ],
    xing: [
      'M 30,20 C 43,18 57,18 70,20', // 顶横（弯曲）
      'M 50,20 C 51,27 49,33 50,40', // 上竖（微曲）
      'M 30,40 C 43,38 57,38 70,40', // 中横（弯曲）
      'M 35,40 C 30,50 25,60 20,70', // 左撇（弯曲）
      'M 65,40 C 70,50 75,60 80,70', // 右捺（弯曲）
      'M 40,60 C 47,58 53,58 60,60', // 底横（弯曲）
      'M 50,40 C 51,53 49,67 50,80'  // 下竖（微曲）
    ]
  },
  '伟': {
    kai: [
      'M 20,40 L 35,40', // 人字左
      'M 35,40 L 50,20', // 人字右
      'M 35,40 L 35,80', // 人字中竖
      'M 60,20 L 80,20', // 右上横
      'M 70,20 L 70,40', // 右上竖
      'M 60,40 L 80,40', // 右中横
      'M 70,40 L 70,60', // 右中竖
      'M 60,60 L 80,60', // 右下横
      'M 70,60 L 70,80'  // 右下竖
    ],
    xing: [
      'M 20,40 C 25,38 30,38 35,40', // 人字左（弯曲）
      'M 35,40 C 40,33 45,27 50,20', // 人字右（弯曲）
      'M 35,40 C 36,53 34,67 35,80', // 人字中竖（微曲）
      'M 60,20 C 67,18 73,18 80,20', // 右上横（弯曲）
      'M 70,20 C 71,27 69,33 70,40', // 右上竖（微曲）
      'M 60,40 C 67,38 73,38 80,40', // 右中横（弯曲）
      'M 70,40 C 71,47 69,53 70,60', // 右中竖（微曲）
      'M 60,60 C 67,58 73,58 80,60', // 右下横（弯曲）
      'M 70,60 C 71,67 69,73 70,80'  // 右下竖（微曲）
    ]
  },
  '婷': {
    kai: [
      'M 20,40 L 30,40', // 女字上横
      'M 30,30 L 30,90', // 女字竖
      'M 30,40 L 15,60', // 女字撇
      'M 30,60 L 40,75', // 女字捺
      'M 50,20 L 70,20', // 右上横
      'M 60,20 L 60,40', // 右上竖
      'M 50,40 L 70,40', // 右中横
      'M 45,55 L 75,55', // 中横
      'M 45,70 L 75,70', // 下横
      'M 60,40 L 60,90'  // 右中竖
    ],
    xing: [
      'M 20,40 C 23,38 27,38 30,40', // 女字上横（弯曲）
      'M 30,30 C 31,50 29,70 30,90', // 女字竖（微曲）
      'M 30,40 C 25,47 20,53 15,60', // 女字撇（弯曲）
      'M 30,60 C 33,65 37,70 40,75', // 女字捺（弯曲）
      'M 50,20 C 57,18 63,18 70,20', // 右上横（弯曲）
      'M 60,20 C 61,27 59,33 60,40', // 右上竖（微曲）
      'M 50,40 C 57,38 63,38 70,40', // 右中横（弯曲）
      'M 45,55 C 55,53 65,53 75,55', // 中横（弯曲）
      'M 45,70 C 55,68 65,68 75,70', // 下横（弯曲）
      'M 60,40 C 61,57 59,73 60,90'  // 右中竖（微曲）
    ]
  },
  // 默认笔画（用于未定义的名字）
  'default': {
    kai: [
      enhancedStrokes.horizontal.kai,
      enhancedStrokes.vertical.kai, 
      enhancedStrokes.horizontalBreak.kai,
      enhancedStrokes.verticalHook.kai
    ],
    xing: [
      enhancedStrokes.horizontal.xing,
      enhancedStrokes.vertical.xing,
      enhancedStrokes.horizontalBreak.xing,
      enhancedStrokes.verticalHook.xing
    ]
  }
};

// 获取字符的笔画数据（优先检查姓氏和名字库，然后使用默认）
const getCharacterStrokes = (
  char: string, 
  style: 'kai' | 'xing'
): string[] => {
  // 先检查姓氏库
  if (surnameStrokes[char]) {
    console.log(`找到姓氏"${char}"的${style}风格笔画数据`);
    return surnameStrokes[char][style];
  }
  
  // 再检查名字库
  if (givenNameStrokes[char]) {
    console.log(`找到名字"${char}"的${style}风格笔画数据`);
    return givenNameStrokes[char][style];
  }
  
  // 如果在基本字库中未找到，尝试识别字的基本结构
  const basicStrokes = getBasicStructureStrokes(char, style);
  if (basicStrokes.length > 0) {
    console.log(`根据基本结构为"${char}"生成了${style}风格笔画数据`);
    return basicStrokes;
  }
  
  console.warn(`未找到字符"${char}"的笔画数据，使用默认笔画`);
  // 使用默认笔画
  return style === 'kai' 
    ? [
        enhancedStrokes.horizontal.kai,
        enhancedStrokes.vertical.kai,
        enhancedStrokes.leftFalling.kai,
        enhancedStrokes.rightFalling.kai
      ]
    : [
        enhancedStrokes.horizontal.xing,
        enhancedStrokes.vertical.xing,
        enhancedStrokes.leftFalling.xing,
        enhancedStrokes.rightFalling.xing
      ];
};

// 根据汉字基本结构生成笔画
// 这个函数尝试为未在专门库中定义的字生成基本笔画
const getBasicStructureStrokes = (char: string, style: 'kai' | 'xing'): string[] => {
  // 这里是一个简化的处理方法，实际应用中可能需要更复杂的汉字结构分析
  // 基于字形分类生成基本笔画
  
  // 左右结构 (如: 你，好，他)
  if (['你', '好', '他', '们', '她', '休', '位', '伦', '做', '很'].includes(char)) {
    return style === 'kai' ? [
      'M 20,20 L 20,80', // 左侧竖
      'M 30,35 L 40,35', // 左侧横(上)
      'M 30,65 L 40,65', // 左侧横(下)
      'M 55,25 L 80,25', // 右侧横(上)
      'M 60,25 L 60,50', // 右侧竖
      'M 55,50 L 80,50', // 右侧横(中)
      'M 60,50 L 60,75', // 右侧竖
      'M 55,75 L 80,75'  // 右侧横(下)
    ] : [
      'M 20,20 C 21,40 19,60 20,80', // 左侧竖（弯曲）
      'M 30,35 C 33,33 37,33 40,35', // 左侧横(上)（弯曲）
      'M 30,65 C 33,63 37,63 40,65', // 左侧横(下)（弯曲）
      'M 55,25 C 65,23 75,23 80,25', // 右侧横(上)（弯曲）
      'M 60,25 C 61,35 59,45 60,50', // 右侧竖（弯曲）
      'M 55,50 C 65,48 75,48 80,50', // 右侧横(中)（弯曲）
      'M 60,50 C 61,60 59,70 60,75', // 右侧竖（弯曲）
      'M 55,75 C 65,73 75,73 80,75'  // 右侧横(下)（弯曲）
    ];
  }
  
  // 上下结构 (如: 字，学，安)
  if (['字', '学', '安', '室', '家', '富', '宁', '完', '定', '守'].includes(char)) {
    return style === 'kai' ? [
      'M 30,20 L 70,20', // 上部横(上)
      'M 40,20 L 40,40', // 上部竖(左)
      'M 60,20 L 60,40', // 上部竖(右)
      'M 30,40 L 70,40', // 上部横(下)
      'M 35,50 L 65,50', // 中部横
      'M 50,40 L 50,80', // 中部竖
      'M 35,65 L 65,65', // 下部横(上)
      'M 35,80 L 65,80'  // 下部横(下)
    ] : [
      'M 30,20 C 43,18 57,18 70,20', // 上部横(上)（弯曲）
      'M 40,20 C 41,27 39,33 40,40', // 上部竖(左)（弯曲）
      'M 60,20 C 61,27 59,33 60,40', // 上部竖(右)（弯曲）
      'M 30,40 C 43,38 57,38 70,40', // 上部横(下)（弯曲）
      'M 35,50 C 45,48 55,48 65,50', // 中部横（弯曲）
      'M 50,40 C 51,55 49,70 50,80', // 中部竖（弯曲）
      'M 35,65 C 45,63 55,63 65,65', // 下部横(上)（弯曲）
      'M 35,80 C 45,78 55,78 65,80'  // 下部横(下)（弯曲）
    ];
  }
  
  // 单一结构 (如: 日，目，田)
  if (['日', '目', '田', '口', '四', '回', '国', '因', '团', '圆'].includes(char)) {
    return style === 'kai' ? [
      'M 25,25 L 75,25', // 上横
      'M 25,25 L 25,75', // 左竖
      'M 75,25 L 75,75', // 右竖
      'M 25,50 L 75,50', // 中横
      'M 25,75 L 75,75'  // 下横
    ] : [
      'M 25,25 C 40,23 60,23 75,25', // 上横（弯曲）
      'M 25,25 C 27,40 23,60 25,75', // 左竖（弯曲）
      'M 75,25 C 77,40 73,60 75,75', // 右竖（弯曲）
      'M 25,50 C 40,48 60,48 75,50', // 中横（弯曲）
      'M 25,75 C 40,73 60,73 75,75'  // 下横（弯曲）
    ];
  }
  
  // 包围结构 (如: 国，回，园)
  if (['国', '回', '园', '围', '图', '固', '圆', '困', '圈', '闭'].includes(char)) {
    return style === 'kai' ? [
      'M 20,20 L 80,20', // 上横
      'M 20,20 L 20,80', // 左竖
      'M 80,20 L 80,80', // 右竖
      'M 20,80 L 80,80', // 下横
      'M 35,40 L 65,40', // 内上横
      'M 35,60 L 65,60', // 内下横
      'M 50,40 L 50,60'  // 内中竖
    ] : [
      'M 20,20 C 40,18 60,18 80,20', // 上横（弯曲）
      'M 20,20 C 22,40 18,60 20,80', // 左竖（弯曲）
      'M 80,20 C 82,40 78,60 80,80', // 右竖（弯曲）
      'M 20,80 C 40,78 60,78 80,80', // 下横（弯曲）
      'M 35,40 C 45,38 55,38 65,40', // 内上横（弯曲）
      'M 35,60 C 45,58 55,58 65,60', // 内下横（弯曲）
      'M 50,40 C 51,47 49,53 50,60'  // 内中竖（弯曲）
    ];
  }
  
  // 如果没有匹配到任何结构，返回空数组
  return [];
};

// 生成字符的笔画动画数据
export const generateCharacterStrokes = (
  char: string,
  style: 'kai' | 'xing',
  baseDelay: number = 0,
  strokeDuration: number = 0.5
): Stroke[] => {
  // 获取字符的笔画数据
  const strokePaths = getCharacterStrokes(char, style);
  
  // 转换为带动画参数的笔画数据
  return strokePaths.map((path, index) => ({
    path,
    duration: strokeDuration,
    delay: baseDelay + index * strokeDuration * 0.8 // 笔画间有一点重叠，更流畅
  }));
};

// 为整个名字生成书法动画
export const generateCalligraphyAnimation = (
  name: string,
  style: 'kai' | 'xing' = 'kai',
  charDuration: number = 2.5
): Stroke[] => {
  let allStrokes: Stroke[] = [];
  let currentDelay = 0;
  
  console.log(`为"${name}"生成${style}风格书法动画`);
  
  if (!name || name.length === 0) {
    console.warn('名字为空，无法生成书法动画');
    return [];
  }
  
  // 为名字中的每个字符生成笔画
  for (let i = 0; i < name.length; i++) {
    const char = name.charAt(i);
    console.log(`处理字符: "${char}" (代码点: ${char.charCodeAt(0).toString(16)})`);
    
    // 获取字符的笔画数据
    const charStrokes = generateCharacterStrokes(char, style, currentDelay);
    
    if (charStrokes.length === 0) {
      console.warn(`字符"${char}"没有生成任何笔画，使用默认基本笔画代替`);
      
      // 使用基本笔画代替
      const basicStrokes = getBasicStructureStrokes(char, style);
      if (basicStrokes.length > 0) {
        console.log(`为"${char}"生成了${basicStrokes.length}个基本笔画`);
        
        // 转换为带动画参数的笔画数据
        const animatedBasicStrokes = basicStrokes.map((path, index) => ({
          path,
          duration: 0.5,
          delay: currentDelay + index * 0.4
        }));
        
        allStrokes = [...allStrokes, ...animatedBasicStrokes];
        
        // 更新下一个字的延迟时间
        const lastStroke = animatedBasicStrokes[animatedBasicStrokes.length - 1];
        currentDelay = lastStroke.delay + lastStroke.duration + 0.5;
      } else {
        // 即使没有基本笔画，也要留出空间
        currentDelay += charDuration;
      }
    } else {
      console.log(`为字符"${char}"生成了${charStrokes.length}个笔画`);
      allStrokes = [...allStrokes, ...charStrokes];
      
      // 更新下一个字的延迟时间
      const lastStroke = charStrokes[charStrokes.length - 1];
      currentDelay = lastStroke.delay + lastStroke.duration + 0.5; // 字与字之间添加0.5秒间隔
    }
  }
  
  console.log(`总共生成了${allStrokes.length}个笔画`);
  
  if (allStrokes.length === 0) {
    console.warn('没有生成任何笔画，可能需要添加更多汉字的笔画数据');
  }
  
  return allStrokes;
}; 