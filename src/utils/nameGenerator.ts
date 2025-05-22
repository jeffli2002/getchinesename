import { NameInput, GeneratedName } from '@/types';

// 中文姓氏库
const surnames = [
  { char: '李', pinyin: 'Lǐ', meaning: { en: 'Plum tree', fr: 'Prunier', zh: '李树' } },
  { char: '王', pinyin: 'Wáng', meaning: { en: 'King', fr: 'Roi', zh: '王者' } },
  { char: '张', pinyin: 'Zhāng', meaning: { en: 'To spread out', fr: 'Étaler', zh: '张开' } },
  { char: '刘', pinyin: 'Liú', meaning: { en: 'To kill', fr: 'Tuer', zh: '杀戮' } },
  { char: '陈', pinyin: 'Chén', meaning: { en: 'To exhibit', fr: 'Exposer', zh: '陈列' } },
  { char: '杨', pinyin: 'Yáng', meaning: { en: 'Poplar', fr: 'Peuplier', zh: '杨树' } },
  { char: '黄', pinyin: 'Huáng', meaning: { en: 'Yellow', fr: 'Jaune', zh: '黄色' } },
  { char: '赵', pinyin: 'Zhào', meaning: { en: 'To surpass', fr: 'Dépasser', zh: '超越' } },
  { char: '吴', pinyin: 'Wú', meaning: { en: 'Weapon', fr: 'Arme', zh: '武器' } },
  { char: '周', pinyin: 'Zhōu', meaning: { en: 'Cycle', fr: 'Cycle', zh: '循环' } },
  { char: '徐', pinyin: 'Xú', meaning: { en: 'Slowly', fr: 'Lentement', zh: '缓慢' } },
  { char: '孙', pinyin: 'Sūn', meaning: { en: 'Grandson', fr: 'Petit-fils', zh: '孙子' } },
  { char: '马', pinyin: 'Mǎ', meaning: { en: 'Horse', fr: 'Cheval', zh: '马匹' } },
  { char: '朱', pinyin: 'Zhū', meaning: { en: 'Vermilion', fr: 'Vermillon', zh: '朱红色' } },
  { char: '胡', pinyin: 'Hú', meaning: { en: 'Recklessly', fr: 'Témérairement', zh: '胡乱' } },
  { char: '韩', pinyin: 'Hán', meaning: { en: 'Korea', fr: 'Corée', zh: '韩国' } }
];

// 男性名字字库
const maleNameChars = [
  { char: '强', pinyin: 'Qiáng', meaning: { en: 'Strong', fr: 'Fort', zh: '强壮' } },
  { char: '伟', pinyin: 'Wěi', meaning: { en: 'Great', fr: 'Grand', zh: '伟大' } },
  { char: '勇', pinyin: 'Yǒng', meaning: { en: 'Brave', fr: 'Courageux', zh: '勇敢' } },
  { char: '军', pinyin: 'Jūn', meaning: { en: 'Army', fr: 'Armée', zh: '军队' } },
  { char: '涛', pinyin: 'Tāo', meaning: { en: 'Great waves', fr: 'Grandes vagues', zh: '波涛' } },
  { char: '杰', pinyin: 'Jié', meaning: { en: 'Outstanding', fr: 'Exceptionnel', zh: '杰出' } },
  { char: '峰', pinyin: 'Fēng', meaning: { en: 'Peak', fr: 'Sommet', zh: '山峰' } },
  { char: '刚', pinyin: 'Gāng', meaning: { en: 'Hard', fr: 'Dur', zh: '坚硬' } },
  { char: '明', pinyin: 'Míng', meaning: { en: 'Bright', fr: 'Lumineux', zh: '明亮' } },
  { char: '欢', pinyin: 'Huān', meaning: { en: 'Happy', fr: 'Heureux', zh: '欢乐' } },
  { char: '建', pinyin: 'Jiàn', meaning: { en: 'Build', fr: 'Construire', zh: '建造' } },
  { char: '文', pinyin: 'Wén', meaning: { en: 'Culture', fr: 'Culture', zh: '文化' } },
  { char: '辉', pinyin: 'Huī', meaning: { en: 'Splendid', fr: 'Splendide', zh: '辉煌' } },
  { char: '力', pinyin: 'Lì', meaning: { en: 'Power', fr: 'Puissance', zh: '力量' } },
  { char: '成', pinyin: 'Chéng', meaning: { en: 'Accomplish', fr: 'Accomplir', zh: '成就' } }
];

// 女性名字字库
const femaleNameChars = [
  { char: '芳', pinyin: 'Fāng', meaning: { en: 'Fragrant', fr: 'Parfumé', zh: '芬芳' } },
  { char: '娟', pinyin: 'Juān', meaning: { en: 'Beautiful', fr: 'Belle', zh: '美丽' } },
  { char: '敏', pinyin: 'Mǐn', meaning: { en: 'Quick', fr: 'Rapide', zh: '敏捷' } },
  { char: '静', pinyin: 'Jìng', meaning: { en: 'Quiet', fr: 'Tranquille', zh: '安静' } },
  { char: '婷', pinyin: 'Tíng', meaning: { en: 'Graceful', fr: 'Gracieux', zh: '优雅' } },
  { char: '雪', pinyin: 'Xuě', meaning: { en: 'Snow', fr: 'Neige', zh: '雪花' } },
  { char: '洁', pinyin: 'Jié', meaning: { en: 'Clean', fr: 'Propre', zh: '洁净' } },
  { char: '燕', pinyin: 'Yàn', meaning: { en: 'Swallow', fr: 'Hirondelle', zh: '燕子' } },
  { char: '玲', pinyin: 'Líng', meaning: { en: 'Tinkling', fr: 'Tintement', zh: '叮玲' } },
  { char: '娜', pinyin: 'Nà', meaning: { en: 'Graceful', fr: 'Élégant', zh: '优美' } },
  { char: '丽', pinyin: 'Lì', meaning: { en: 'Beautiful', fr: 'Belle', zh: '美丽' } },
  { char: '秀', pinyin: 'Xiù', meaning: { en: 'Elegant', fr: 'Élégant', zh: '秀丽' } },
  { char: '英', pinyin: 'Yīng', meaning: { en: 'Flower', fr: 'Fleur', zh: '花朵' } },
  { char: '梅', pinyin: 'Méi', meaning: { en: 'Plum blossom', fr: 'Fleur de prunier', zh: '梅花' } },
  { char: '云', pinyin: 'Yún', meaning: { en: 'Cloud', fr: 'Nuage', zh: '云彩' } }
];

// 中性名字字库（适合男女）
const unisexNameChars = [
  { char: '林', pinyin: 'Lín', meaning: { en: 'Forest', fr: 'Forêt', zh: '森林' } },
  { char: '海', pinyin: 'Hǎi', meaning: { en: 'Sea', fr: 'Mer', zh: '海洋' } },
  { char: '鑫', pinyin: 'Xīn', meaning: { en: 'Prosperity', fr: 'Prospérité', zh: '繁荣' } },
  { char: '宇', pinyin: 'Yǔ', meaning: { en: 'Universe', fr: 'Univers', zh: '宇宙' } },
  { char: '轩', pinyin: 'Xuān', meaning: { en: 'High room', fr: 'Pièce haute', zh: '高屋' } },
  { char: '晨', pinyin: 'Chén', meaning: { en: 'Morning', fr: 'Matin', zh: '早晨' } },
  { char: '辰', pinyin: 'Chén', meaning: { en: 'Morning', fr: 'Matin', zh: '早晨' } },
  { char: '曦', pinyin: 'Xī', meaning: { en: 'Sunshine', fr: 'Soleil', zh: '阳光' } },
  { char: '瑞', pinyin: 'Ruì', meaning: { en: 'Auspicious', fr: 'Propice', zh: '吉祥' } },
  { char: '凯', pinyin: 'Kǎi', meaning: { en: 'Victory', fr: 'Victoire', zh: '胜利' } }
];

// 五行元素
const wuXing = {
  wood: {
    chars: ['木', '林', '森', '华', '柏', '松', '竹', '翠', '青', '苗'],
    meaning: {
      en: 'Wood element represents growth, creativity, and expansion',
      fr: 'L\'élément bois représente la croissance, la créativité et l\'expansion',
      zh: '木代表生长、创造和发展'
    }
  },
  fire: {
    chars: ['火', '炎', '焱', '煜', '炅', '烨', '烽', '光', '明', '晖'],
    meaning: {
      en: 'Fire element represents passion, energy, and transformation',
      fr: 'L\'élément feu représente la passion, l\'énergie et la transformation',
      zh: '火代表热情、能量和转变'
    }
  },
  earth: {
    chars: ['土', '地', '坤', '峰', '岩', '山', '石', '磊', '固', '安'],
    meaning: {
      en: 'Earth element represents stability, reliability, and nurturing',
      fr: 'L\'élément terre représente la stabilité, la fiabilité et la protection',
      zh: '土代表稳定、可靠和滋养'
    }
  },
  metal: {
    chars: ['金', '铭', '钧', '铁', '钢', '银', '锋', '铮', '锐', '坚'],
    meaning: {
      en: 'Metal element represents precision, efficiency, and structure',
      fr: 'L\'élément métal représente la précision, l\'efficacité et la structure',
      zh: '金代表精确、效率和结构'
    }
  },
  water: {
    chars: ['水', '江', '河', '海', '洋', '淼', '泉', '涵', '渊', '滔'],
    meaning: {
      en: 'Water element represents wisdom, adaptability, and emotions',
      fr: 'L\'élément eau représente la sagesse, l\'adaptabilité et les émotions',
      zh: '水代表智慧、适应性和情感'
    }
  }
};

// 根据职业分类
const professionCategories = {
  business: {
    chars: ['商', '财', '富', '达', '旺', '企', '贸', '盈', '利', '益'],
    meaning: {
      en: 'Business and wealth related characters',
      fr: 'Caractères liés aux affaires et à la richesse',
      zh: '商业和财富相关字'
    }
  },
  technology: {
    chars: ['科', '技', '创', '新', '智', '研', '电', '数', '码', '网'],
    meaning: {
      en: 'Technology and innovation related characters',
      fr: 'Caractères liés à la technologie et à l\'innovation',
      zh: '科技和创新相关字'
    }
  },
  art: {
    chars: ['艺', '文', '雅', '美', '韵', '诗', '画', '声', '乐', '舞'],
    meaning: {
      en: 'Art and culture related characters',
      fr: 'Caractères liés à l\'art et à la culture',
      zh: '艺术和文化相关字'
    }
  },
  education: {
    chars: ['学', '教', '知', '慧', '博', '思', '悟', '育', '才', '德'],
    meaning: {
      en: 'Education and knowledge related characters',
      fr: 'Caractères liés à l\'éducation et à la connaissance',
      zh: '教育和知识相关字'
    }
  },
  medicine: {
    chars: ['医', '药', '康', '健', '治', '护', '安', '生', '命', '心'],
    meaning: {
      en: 'Medicine and health related characters',
      fr: 'Caractères liés à la médecine et à la santé',
      zh: '医药和健康相关字'
    }
  }
};

// 根据原始名字音译找到相似的中文姓氏
const findSimilarSurname = (originalName: string): typeof surnames[0] => {
  // 处理空值情况
  if (!originalName || originalName.trim() === '') {
    // 返回一个默认的常见姓氏
    return surnames.find(s => s.char === '李') || surnames[0];
  }
  
  // 处理姓名中可能包含的姓氏部分
  let lastName = originalName;
  if (originalName.includes(' ')) {
    // 如果有空格，取最后一个词作为姓氏
    const nameParts = originalName.split(' ');
    lastName = nameParts[nameParts.length - 1];
  }
  
  // 转为小写以便比较
  const lastNameLower = lastName.toLowerCase();
  
  // 常见英文姓氏与中文姓氏的直接映射
  interface SurnameMapping {
    en: string; 
    zh: string[];
  }
  
  const surnameMap: SurnameMapping[] = [
    { en: 'lee', zh: ['李', '黎', '理'] },
    { en: 'li', zh: ['李', '黎', '理'] },
    { en: 'wang', zh: ['王', '汪'] },
    { en: 'wong', zh: ['王', '汪'] },
    { en: 'chen', zh: ['陈', '程'] },
    { en: 'chan', zh: ['陈', '詹'] },
    { en: 'zhang', zh: ['张', '章'] },
    { en: 'chang', zh: ['张', '常'] },
    { en: 'wu', zh: ['吴', '武'] },
    { en: 'liu', zh: ['刘', '柳'] },
    { en: 'lau', zh: ['刘', '娄'] },
    { en: 'zhao', zh: ['赵', '肇'] },
    { en: 'chao', zh: ['赵', '晁'] },
    { en: 'huang', zh: ['黄', '皇'] },
    { en: 'zhou', zh: ['周', '州'] },
    { en: 'chow', zh: ['周', '仇'] },
    { en: 'xu', zh: ['徐', '许'] },
    { en: 'hsu', zh: ['徐', '许'] },
    { en: 'sun', zh: ['孙', '宋'] },
    { en: 'ma', zh: ['马', '麻'] },
    { en: 'zhu', zh: ['朱', '竺'] },
    { en: 'chu', zh: ['朱', '褚'] },
    { en: 'guo', zh: ['郭', '国'] },
    { en: 'kuo', zh: ['郭', '阔'] },
    { en: 'lin', zh: ['林', '蔺'] },
    { en: 'yang', zh: ['杨', '仰'] },
    { en: 'young', zh: ['杨', '阳'] },
    { en: 'tang', zh: ['唐', '汤'] },
    { en: 'deng', zh: ['邓', '登'] },
    { en: 'feng', zh: ['冯', '风'] },
    { en: 'song', zh: ['宋', '松'] },
    { en: 'cai', zh: ['蔡', '才'] },
    { en: 'tsai', zh: ['蔡', '才'] },
    { en: 'xie', zh: ['谢', '解'] },
    { en: 'ye', zh: ['叶', '页'] },
    { en: 'yeh', zh: ['叶', '页'] },
    { en: 'yip', zh: ['叶', '页'] },
    // 西方常见姓氏
    { en: 'smith', zh: ['史', '斯'] },
    { en: 'johnson', zh: ['江', '章'] },
    { en: 'williams', zh: ['威', '魏'] },
    { en: 'brown', zh: ['布', '鲍'] },
    { en: 'jones', zh: ['琼', '钧'] },
    { en: 'miller', zh: ['米', '穆'] },
    { en: 'davis', zh: ['戴', '德'] },
    { en: 'garcia', zh: ['高', '戈'] },
    { en: 'rodriguez', zh: ['罗', '鲁'] },
    { en: 'wilson', zh: ['威', '韦'] },
    { en: 'martinez', zh: ['马', '梅'] },
    { en: 'anderson', zh: ['安', '艾'] },
    { en: 'taylor', zh: ['泰', '陶'] },
    { en: 'thomas', zh: ['汤', '唐'] },
    { en: 'hernandez', zh: ['何', '韩'] },
    { en: 'moore', zh: ['莫', '穆'] },
    { en: 'martin', zh: ['马', '梅'] },
    { en: 'jackson', zh: ['杰', '江'] },
    { en: 'thompson', zh: ['汤', '唐'] },
    { en: 'white', zh: ['怀', '威'] },
    { en: 'lopez', zh: ['罗', '卢'] },
    { en: 'gonzalez', zh: ['龚', '宫'] },
    { en: 'harris', zh: ['哈', '海'] },
    { en: 'clark', zh: ['克', '柯'] },
    { en: 'lewis', zh: ['刘', '雷'] },
    { en: 'robinson', zh: ['罗', '鲁'] },
    { en: 'walker', zh: ['王', '魏'] },
    { en: 'perez', zh: ['彭', '裴'] },
    { en: 'hall', zh: ['霍', '何'] },
    { en: 'allen', zh: ['艾', '安'] },
    { en: 'sanchez', zh: ['桑', '申'] },
    { en: 'wright', zh: ['赖', '莱'] },
    { en: 'king', zh: ['金', '京'] },
    { en: 'scott', zh: ['斯', '史'] },
    { en: 'green', zh: ['格', '葛'] },
    { en: 'baker', zh: ['贝', '白'] },
    { en: 'adams', zh: ['艾', '安'] },
    { en: 'nelson', zh: ['尼', '聂'] },
    { en: 'hill', zh: ['希', '胡'] },
    { en: 'ramirez', zh: ['雷', '兰'] },
    { en: 'campbell', zh: ['坎', '康'] },
    { en: 'mitchell', zh: ['米', '穆'] },
    { en: 'roberts', zh: ['罗', '鲁'] },
    { en: 'carter', zh: ['卡', '柯'] },
    { en: 'phillips', zh: ['菲', '范'] },
    { en: 'evans', zh: ['伊', '叶'] },
    { en: 'turner', zh: ['唐', '陶'] },
    { en: 'torres', zh: ['陶', '托'] },
    { en: 'parker', zh: ['朴', '潘'] },
    { en: 'collins', zh: ['柯', '科'] },
    { en: 'edwards', zh: ['爱', '艾'] },
    { en: 'stewart', zh: ['斯', '史'] },
    { en: 'flores', zh: ['弗', '范'] },
    { en: 'morris', zh: ['莫', '穆'] },
    { en: 'nguyen', zh: ['阮', '钮'] },
    { en: 'murphy', zh: ['穆', '默'] },
    { en: 'rivera', zh: ['李', '黎'] },
    { en: 'cook', zh: ['库', '柯'] },
    { en: 'rogers', zh: ['罗', '鲁'] },
    { en: 'morgan', zh: ['摩', '莫'] },
    { en: 'peterson', zh: ['彼', '潘'] },
    { en: 'cooper', zh: ['库', '柯'] },
    { en: 'reed', zh: ['李', '里'] },
    { en: 'bailey', zh: ['贝', '白'] },
    { en: 'bell', zh: ['贝', '白'] },
    { en: 'gomez', zh: ['高', '戈'] },
    { en: 'kelly', zh: ['凯', '柯'] },
    { en: 'howard', zh: ['霍', '侯'] },
    { en: 'ward', zh: ['沃', '韦'] },
    { en: 'cox', zh: ['科', '柯'] },
    { en: 'diaz', zh: ['迪', '狄'] },
    { en: 'richardson', zh: ['理', '里'] },
    { en: 'wood', zh: ['伍', '吴'] },
    { en: 'watson', zh: ['沃', '韦'] },
    { en: 'brooks', zh: ['布', '鲍'] },
    { en: 'bennett', zh: ['本', '班'] },
    { en: 'gray', zh: ['格', '葛'] },
    { en: 'james', zh: ['詹', '姜'] },
    { en: 'reyes', zh: ['雷', '赖'] },
    { en: 'cruz', zh: ['克', '柯'] },
    { en: 'hughes', zh: ['休', '胡'] },
    { en: 'price', zh: ['普', '裴'] },
    { en: 'myers', zh: ['迈', '麦'] },
    { en: 'long', zh: ['龙', '隆'] },
    { en: 'foster', zh: ['福', '范'] },
    { en: 'sanders', zh: ['桑', '申'] },
    { en: 'ross', zh: ['罗', '鲁'] },
    { en: 'morales', zh: ['莫', '摩'] },
    { en: 'powell', zh: ['鲍', '包'] },
    { en: 'sullivan', zh: ['苏', '舒'] },
    { en: 'russell', zh: ['罗', '鲁'] },
    { en: 'ortiz', zh: ['奥', '欧'] },
    { en: 'jenkins', zh: ['金', '简'] },
    { en: 'gutierrez', zh: ['古', '顾'] },
    { en: 'perry', zh: ['佩', '裴'] },
    { en: 'butler', zh: ['巴', '布'] },
    { en: 'barnes', zh: ['巴', '班'] },
    { en: 'fisher', zh: ['费', '范'] }
  ];
  
  // 1. 首先尝试直接匹配常见姓氏
  const exactMatch = surnameMap.find(item => item.en === lastNameLower);
  if (exactMatch) {
    const matchedChineseNames = exactMatch.zh;
    // 查找对应的姓氏对象
    const matchingSurnames = surnames.filter(surname => 
      matchedChineseNames.includes(surname.char)
    );
    
    if (matchingSurnames.length > 0) {
      return matchingSurnames[Math.floor(Math.random() * matchingSurnames.length)];
    }
  }
  
  // 2. 尝试部分匹配（包含关系）
  const partialMatches = surnameMap.filter(item => 
    lastNameLower.includes(item.en) || item.en.includes(lastNameLower)
  );
  
  if (partialMatches.length > 0) {
    // 选择一个部分匹配的姓氏
    const selectedMatch = partialMatches[Math.floor(Math.random() * partialMatches.length)];
    const matchingSurnames = surnames.filter(surname => 
      selectedMatch.zh.includes(surname.char)
    );
    
    if (matchingSurnames.length > 0) {
      return matchingSurnames[Math.floor(Math.random() * matchingSurnames.length)];
    }
  }
  
  // 获取姓氏的首字母
  const firstChar = lastNameLower.charAt(0).toLowerCase();
  
  // 3. 按首字母匹配
  // 创建音译映射关系
  const transliterationMap: Record<string, string[]> = {
    'a': ['艾', '安', '奥', '阿'],
    'b': ['白', '柏', '班', '包', '贝', '毕', '卞', '边'],
    'c': ['蔡', '曹', '陈', '程', '崔'],
    'd': ['戴', '邓', '丁', '董', '杜', '段'],
    'e': ['鄂', '恩'],
    'f': ['范', '方', '费', '冯', '傅'],
    'g': ['甘', '高', '葛', '龚', '顾', '郭'],
    'h': ['韩', '何', '贺', '洪', '侯', '胡', '黄'],
    'i': ['伊', '易', '乙'],
    'j': ['冀', '季', '姬', '简', '江', '蒋', '焦', '金'],
    'k': ['康', '柯', '孔'],
    'l': ['赖', '蓝', '李', '黎', '梁', '廖', '林', '刘', '龙', '卢', '吕', '罗'],
    'm': ['马', '麦', '梅', '孟', '苗', '莫'],
    'n': ['倪', '聂', '牛', '宁'],
    'o': ['欧', '区'],
    'p': ['潘', '彭', '蒲', '濮'],
    'q': ['戚', '钱', '强', '秦', '邱', '裘', '曲'],
    'r': ['任', '容', '阮'],
    's': ['沙', '商', '邵', '沈', '盛', '施', '石', '宋', '苏', '孙'],
    't': ['谭', '汤', '唐', '陶', '田', '童'],
    'u': ['乌', '巫'],
    'v': ['维', '文'],
    'w': ['万', '王', '魏', '卫', '温', '翁', '吴', '伍'],
    'x': ['夏', '肖', '谢', '徐', '许', '薛', '荀'],
    'y': ['严', '言', '颜', '杨', '姚', '叶', '易', '尹', '应', '雍', '尤', '游', '于', '余', '俞', '虞', '元', '袁', '岳'],
    'z': ['宰', '詹', '张', '赵', '郑', '钟', '周', '朱', '祝', '邹']
  };
  
  // 按首字母查找对应的中文字符
  if (transliterationMap[firstChar]) {
    const possibleChars = transliterationMap[firstChar];
    const possibleSurnames = surnames.filter(surname => 
      possibleChars.includes(surname.char)
    );
    
    if (possibleSurnames.length > 0) {
      return possibleSurnames[Math.floor(Math.random() * possibleSurnames.length)];
    }
  }
  
  // 4. 查找姓氏拼音以相同字母开头的
  const matchingSurnames = surnames.filter(surname => 
    surname.pinyin.toLowerCase().startsWith(firstChar)
  );
  
  if (matchingSurnames.length > 0) {
    return matchingSurnames[Math.floor(Math.random() * matchingSurnames.length)];
  }
  
  // 5. 如果还是没找到匹配的，随机返回一个
  return surnames[Math.floor(Math.random() * surnames.length)];
};

// 根据生日计算五行属性
const calculateWuXing = (birthDate: string): string => {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 简化版的五行计算
  const sum = year + month + day;
  const remainder = sum % 5;
  
  switch(remainder) {
    case 0: return 'wood';
    case 1: return 'fire';
    case 2: return 'earth';
    case 3: return 'metal';
    case 4: return 'water';
    default: return 'wood';
  }
};

// 根据职业选择适合的字
const getCharsByProfession = (profession: string): string[] => {
  // 转换为小写进行匹配
  const profLower = profession.toLowerCase();
  
  // 尝试匹配职业类别
  for (const [category, data] of Object.entries(professionCategories)) {
    if (profLower.includes(category)) {
      return data.chars;
    }
  }
  
  // 默认返回商业类字符
  return professionCategories.business.chars;
};

// 结合姓氏和名字生成完整名字
const generateName = (
  surname: typeof surnames[0],
  nameChar1: string,
  nameChar2: string | null,
  wuXingElement: string,
  profession: string,
  gender: 'male' | 'female',
  originalName: string
): GeneratedName => {
  const givenName = nameChar2 ? `${nameChar1}${nameChar2}` : nameChar1;
  const fullName = `${surname.char}${givenName}`;
  const pinyin = nameChar2 
    ? `${surname.pinyin} ${getPinyin(nameChar1)} ${getPinyin(nameChar2)}`
    : `${surname.pinyin} ${getPinyin(nameChar1)}`;
  
  // 生成名字意义解释
  const givenNameMeaning = generateNameMeaning(nameChar1, nameChar2, wuXingElement, profession, gender, originalName);
  
  // 生成名字关联信息
  const nameRelation = {
    phoneticSimilarity: generateNameRelation(surname, givenName, originalName, 'en').phoneticSimilarity,
    meaningConnection: generateNameRelation(surname, givenName, originalName, 'en').meaningConnection,
    culturalContext: generateNameRelation(surname, givenName, originalName, 'en').culturalContext
  };
  
  return {
    fullName,
    surname: surname.char,
    givenName,
    pinyin,
    surnameMeaning: surname.meaning,
    givenNameMeaning,
    calligraphy: {
      kai: '',  // 这部分将在书法生成中填充
      xing: ''
    },
    pronunciation: '',  // 这部分将在发音生成中填充
    originalName,  // 添加原始名字以便在UI中显示
    nameRelation
  };
};

// 生成名字关联信息
const generateNameRelation = (
  surname: typeof surnames[0],
  givenName: string,
  originalName: string,
  language: 'en' | 'fr' | 'zh' = 'en'
): { phoneticSimilarity: string; meaningConnection: string; culturalContext: string } => {
  // 提取原名的首字母，确保originalName不为空
  const originalFirstLetter = originalName && originalName.length > 0 
    ? originalName.charAt(0).toLowerCase() 
    : '';
  const surnameFirstLetter = surname.pinyin.charAt(0).toLowerCase();
  
  // 发音相似度
  let phoneticSimilarity = '';
  if (originalFirstLetter && originalFirstLetter === surnameFirstLetter) {
    phoneticSimilarity = language === 'en' 
      ? `The surname "${surname.char}" (${surname.pinyin}) shares a similar sound with "${originalName}".`
      : language === 'fr'
        ? `Le nom de famille "${surname.char}" (${surname.pinyin}) partage un son similaire avec "${originalName}".`
        : `姓氏"${surname.char}"（${surname.pinyin}）与"${originalName}"有相似的发音。`;
  } else {
    phoneticSimilarity = language === 'en'
      ? `This surname was chosen to complement your given name with balanced sounds.`
      : language === 'fr'
        ? `Ce nom de famille a été choisi pour compléter votre prénom avec des sons équilibrés.`
        : `选择这个姓氏是为了用平衡的音韵补充您的名字。`;
  }
  
  // 含义连接
  const meaningConnection = language === 'en'
    ? `These characters reflect qualities that resonate with your original name's essence, creating a cultural bridge.`
    : language === 'fr'
      ? `Ces caractères reflètent des qualités qui résonnent avec l'essence de votre nom d'origine, créant un pont culturel.`
      : `这些汉字反映了与您原名精髓相呼应的品质，架起了文化的桥梁。`;
  
  // 文化背景
  const culturalContext = language === 'en'
    ? `In Chinese culture, names are chosen to bring good fortune and reflect one's character.`
    : language === 'fr'
      ? `Dans la culture chinoise, les noms sont choisis pour apporter la bonne fortune et refléter le caractère.`
      : `在中国文化中，名字是为了带来好运并反映一个人的性格而选择的。`;
  
  return {
    phoneticSimilarity,
    meaningConnection,
    culturalContext
  };
};

// 生成名字含义
const generateNameMeaning = (
  char1: string,
  char2: string | null,
  wuXingElement: string,
  profession: string,
  gender: 'male' | 'female',
  originalName: string
): { en: string; fr: string; zh: string } => {
  // 确保originalName不为空
  const safeName = originalName || '';
  
  // 根据性别选择解释基础
  const genderBase = gender === 'male' 
    ? {
        en: 'This name carries masculine energy',
        fr: 'Ce nom possède une énergie masculine',
        zh: '这个名字带有阳刚之气'
      }
    : {
        en: 'This name embodies feminine elegance',
        fr: 'Ce nom incarne l\'élégance féminine',
        zh: '这个名字体现女性优雅'
      };
  
  // 结合五行元素
  const wuXingMeaning = wuXing[wuXingElement as keyof typeof wuXing].meaning;
  
  // 原名关联 - 改进版本，包含名字含义解释
  const originalNameLink = {
    en: `Your name "${safeName}" inspired this Chinese name, connecting your identity across cultures.`,
    fr: `Votre nom "${safeName}" a inspiré ce nom chinois, reliant votre identité à travers les cultures.`,
    zh: `您的名字"${safeName}"启发了这个中文名，跨越文化连接您的身份。`
  };
  
  // 如果是双字名
  if (char2) {
    return {
      en: `${genderBase.en} and ${wuXingMeaning.en.toLowerCase()}. The first character "${char1}" represents personal qualities, while "${char2}" connects to your destiny. ${originalNameLink.en}`,
      fr: `${genderBase.fr} et ${wuXingMeaning.fr.toLowerCase()}. Le premier caractère "${char1}" représente des qualités personnelles, tandis que "${char2}" se connecte à votre destin. ${originalNameLink.fr}`,
      zh: `${genderBase.zh}，${wuXingMeaning.zh}。第一个字"${char1}"代表个人品质，而"${char2}"则与您的命运相连。${originalNameLink.zh}`
    };
  }
  
  // 如果是单字名
  return {
    en: `${genderBase.en} and ${wuXingMeaning.en.toLowerCase()}. The character "${char1}" was chosen for its powerful meaning and harmonious sound. ${originalNameLink.en}`,
    fr: `${genderBase.fr} et ${wuXingMeaning.fr.toLowerCase()}. Le caractère "${char1}" a été choisi pour sa signification puissante et son son harmonieux. ${originalNameLink.fr}`,
    zh: `${genderBase.zh}，${wuXingMeaning.zh}。字"${char1}"因其有力的含义和和谐的声音而被选择。${originalNameLink.zh}`
  };
};

// 获取汉字拼音（添加声调版）
const getPinyin = (char: string): string => {
  // 先检查姓氏库
  const surnameMatch = surnames.find(item => item.char === char);
  if (surnameMatch) return surnameMatch.pinyin;
  
  // 再检查男性字库
  const maleChar = maleNameChars.find(item => item.char === char);
  if (maleChar) return maleChar.pinyin;
  
  // 再检查女性字库
  const femaleChar = femaleNameChars.find(item => item.char === char);
  if (femaleChar) return femaleChar.pinyin;
  
  // 再检查中性字库
  const unisexChar = unisexNameChars.find(item => item.char === char);
  if (unisexChar) return unisexChar.pinyin;
  
  // 拼音映射字典（附带声调）
  const pinyinData: Record<string, string> = {
    // 姓氏
    '赵': 'Zhào', '钱': 'Qián', '孙': 'Sūn', '李': 'Lǐ', '周': 'Zhōu', 
    '吴': 'Wú', '郑': 'Zhèng', '王': 'Wáng', '冯': 'Féng', '陈': 'Chén',
    '褚': 'Chǔ', '卫': 'Wèi', '蒋': 'Jiǎng', '沈': 'Shěn', '韩': 'Hàn',
    '杨': 'Yáng', '朱': 'Zhū', '秦': 'Qín', '尤': 'Yóu', '许': 'Xǔ',
    '何': 'Hé', '吕': 'Lǚ', '施': 'Shī', '张': 'Zhāng', '孔': 'Kǒng',
    '曹': 'Cáo', '严': 'Yán', '华': 'Huá', '曾': 'Zēng', '魏': 'Wèi',
    '刘': 'Liú', '高': 'Gāo', '汪': 'Wāng', '赖': 'Lài', '谢': 'Xiè', 
    '邓': 'Dèng', '郭': 'Guō', '崔': 'Cuī', '彭': 'Péng', '程': 'Chéng', 
    '傅': 'Fù', '于': 'Yú', '董': 'Dǒng', '苏': 'Sū', '潘': 'Pān', 
    '蔡': 'Cài', '田': 'Tián',
    
    // 男性名字
    '强': 'Qiáng', '伟': 'Wěi', '勇': 'Yǒng', '军': 'Jūn', '涛': 'Tāo',
    '杰': 'Jié', '峰': 'Fēng', '刚': 'Gāng', '明': 'Míng', '欢': 'Huān',
    '建': 'Jiàn', '文': 'Wén', '辉': 'Huī', '力': 'Lì', '成': 'Chéng',
    '东': 'Dōng', '健': 'Jiàn', '世': 'Shì', '广': 'Guǎng', '志': 'Zhì',
    '义': 'Yì', '兴': 'Xīng', '良': 'Liáng', '海': 'Hǎi', '山': 'Shān',
    '仁': 'Rén', '波': 'Bō', '宁': 'Níng', '贵': 'Guì', '福': 'Fú',
    '生': 'Shēng', '龙': 'Lóng', '元': 'Yuán', '全': 'Quán', '国': 'Guó',
    '胜': 'Shèng', '祥': 'Xiáng', '才': 'Cái', '发': 'Fā', '武': 'Wǔ', 
    '新': 'Xīn', '利': 'Lì', '飞': 'Fēi', '彬': 'Bīn',
    
    // 女性名字
    '芳': 'Fāng', '娟': 'Juān', '敏': 'Mǐn', '静': 'Jìng', '婷': 'Tíng',
    '雪': 'Xuě', '洁': 'Jié', '燕': 'Yàn', '玲': 'Líng', '娜': 'Nà',
    '丽': 'Lì', '秀': 'Xiù', '英': 'Yīng', '梅': 'Méi', '云': 'Yún',
    '艳': 'Yàn', '娥': 'É', '妹': 'Mèi', '莉': 'Lì', '桂': 'Guì',
    '花': 'Huā', '瑶': 'Yáo', '红': 'Hóng', '玉': 'Yù', '萍': 'Píng',
    '雅': 'Yǎ', '琴': 'Qín', '珍': 'Zhēn', '珊': 'Shān', '素': 'Sù',
    '芬': 'Fēn', '青': 'Qīng', '霞': 'Xiá', '蓉': 'Róng', '晓': 'Xiǎo',
    '露': 'Lù', '瑛': 'Yīng', '茹': 'Rú', '美': 'Měi', '芝': 'Zhī', 
    '芸': 'Yún', '蕾': 'Lěi', '岚': 'Lán', '倩': 'Qiàn', '彩': 'Cǎi', 
    '苹': 'Píng', '蝶': 'Dié', '莹': 'Yíng',
    
    // 中性名字
    '林': 'Lín', '鑫': 'Xīn', '宇': 'Yǔ', '轩': 'Xuān', '晨': 'Chén', 
    '辰': 'Chén', '曦': 'Xī', '瑞': 'Ruì', '凯': 'Kǎi', '嘉': 'Jiā', 
    '佳': 'Jiā', '雨': 'Yǔ', '思': 'Sī', '智': 'Zhì', '昊': 'Hào', 
    '昱': 'Yù', '慧': 'Huì', '聪': 'Cōng', '颖': 'Yǐng', '亮': 'Liàng', 
    '睿': 'Ruì', '哲': 'Zhé', '铭': 'Míng', '俊': 'Jùn', '博': 'Bó', 
    '翔': 'Xiáng', '弘': 'Hóng', '扬': 'Yáng', '振': 'Zhèn', '维': 'Wéi', 
    '远': 'Yuǎn', '翰': 'Hàn', '旭': 'Xù', '伦': 'Lún', '洋': 'Yáng', 
    '越': 'Yuè', '泽': 'Zé', '浩': 'Hào', '天': 'Tiān', '宸': 'Chén', 
    '言': 'Yán', '若': 'Ruò', '鸿': 'Hóng', '朗': 'Lǎng', '乐': 'Lè', 
    '景': 'Jǐng', '阳': 'Yáng', '春': 'Chūn', '德': 'Dé',
    
    // 五行与自然
    '木': 'Mù', '水': 'Shuǐ', '火': 'Huǒ', '土': 'Tǔ', '金': 'Jīn',
    '日': 'Rì', '月': 'Yuè', '星': 'Xīng', '光': 'Guāng', '风': 'Fēng',
    
    // 其他常用汉字
    '人': 'Rén', '大': 'Dà', '小': 'Xiǎo', '中': 'Zhōng', '地': 'Dì', 
    '家': 'Jiā', '爱': 'Ài', '心': 'Xīn', '年': 'Nián', '时': 'Shí', 
    '好': 'Hǎo', '盛': 'Shèng', '和': 'Hé', '平': 'Píng', '安': 'Ān', 
    '自': 'Zì', '由': 'Yóu', '民': 'Mín', '永': 'Yǒng', '前': 'Qián', 
    '进': 'Jìn', '友': 'Yǒu', '谊': 'Yì', '为': 'Wéi', '方': 'Fāng', 
    '礼': 'Lǐ', '诚': 'Chéng', '信': 'Xìn', '望': 'Wàng', '忠': 'Zhōng', 
    '孝': 'Xiào', '廉': 'Lián', '耀': 'Yào', '先': 'Xiān', '敬': 'Jìng', 
    '善': 'Shàn', '真': 'Zhēn', '正': 'Zhèng', '定': 'Dìng', '灵': 'Líng', 
    '空': 'Kōng', '字': 'Zì', '室': 'Shì', '完': 'Wán', '守': 'Shǒu',
    '你': 'Nǐ', '他': 'Tā', '们': 'Men', '她': 'Tā', '休': 'Xiū', 
    '位': 'Wèi', '做': 'Zuò', '很': 'Hěn', '目': 'Mù', '口': 'Kǒu', 
    '四': 'Sì', '回': 'Huí', '因': 'Yīn', '团': 'Tuán', '圆': 'Yuán', 
    '围': 'Wéi', '图': 'Tú', '固': 'Gù', '困': 'Kùn', '圈': 'Quān', 
    '闭': 'Bì', '学': 'Xué', '富': 'Fù', '顺': 'Shùn', '子': 'Zǐ',
    
    // 修正和新增的拼音
    '烨': 'Yè', '盈': 'Yíng', '禾': 'Hé', '穗': 'Suì', '稻': 'Dào',
    '稼': 'Jià', '秧': 'Yāng', '婵': 'Chán', '婉': 'Wǎn', '娴': 'Xián', 
    '婧': 'Jìng', '娅': 'Yà', '婕': 'Jié', '娆': 'Ráo', '娉': 'Pīng', 
    '娓': 'Wěi', '娇': 'Jiāo', '骏': 'Jùn', '骁': 'Xiāo', '驰': 'Chí', 
    '驹': 'Jū', '驱': 'Qū', '骄': 'Jiāo', '骅': 'Huá', '骋': 'Chěng', 
    '鸥': 'Ōu', '鸽': 'Gē', '鸳': 'Yuān', '鸾': 'Luán', '鹂': 'Lí', 
    '鹃': 'Juān', '鹊': 'Què', '鹭': 'Lù', '黛': 'Dài', 
    '鼎': 'Dǐng', '齐': 'Qí', '宣': 'Xuān', '宪': 'Xiàn',
    '宾': 'Bīn', '宵': 'Xiāo', '宝': 'Bǎo', '寒': 'Hán',
    '寸': 'Cùn', '寿': 'Shòu', '陌': 'Mò', '音': 'Yīn',
    
    // 添加缺失的汉字拼音
    '泉': 'Quán', '商': 'Shāng', '湾': 'Wān', '沟': 'Gōu', '溢': 'Yì',
    '涌': 'Yǒng', '源': 'Yuán', '池': 'Chí', '河': 'Hé',
    '潮': 'Cháo', '漠': 'Mò', '沙': 'Shā', '滩': 'Tān', '浦': 'Pǔ', '渔': 'Yú',
    '岩': 'Yán', '贸': 'Mào', '峻': 'Jùn', '贤': 'Xián', '岭': 'Lǐng', 
    '崇': 'Chóng', '崖': 'Yá', '崩': 'Bēng', '财': 'Cái', '贡': 'Gòng', 
    '货': 'Huò', '贷': 'Dài', '费': 'Fèi', '资': 'Zī', '赢': 'Yíng', 
    '购': 'Gòu', '赠': 'Zèng',
    
    // 五行元素相关
    '森': 'Sēn', '柏': 'Bǎi', '松': 'Sōng', '竹': 'Zhú', 
    '翠': 'Cuì', '苗': 'Miáo', '炎': 'Yán', '焱': 'Yàn', '煜': 'Yù', 
    '炅': 'Jiǒng', '烽': 'Fēng', '晖': 'Huī', '坤': 'Kūn', '石': 'Shí', 
    '磊': 'Lěi', '钧': 'Jūn', '铁': 'Tiě', '钢': 'Gāng', '银': 'Yín', '锋': 'Fēng', 
    '铮': 'Zhēng', '锐': 'Ruì', '坚': 'Jiān', '淼': 'Miǎo', '涵': 'Hán', '渊': 'Yuān', 
    '滔': 'Tāo', '达': 'Dá', '旺': 'Wàng', '江': 'Jiāng',
    
    // 职业相关
    '企': 'Qǐ', '益': 'Yì', '科': 'Kē', '技': 'Jì', '创': 'Chuàng', '研': 'Yán', 
    '电': 'Diàn', '数': 'Shù', '码': 'Mǎ', '网': 'Wǎng', '艺': 'Yì', 
    '韵': 'Yùn', '诗': 'Shī', '画': 'Huà', '声': 'Shēng', 
    '舞': 'Wǔ', '教': 'Jiào', '知': 'Zhī', '悟': 'Wù', '育': 'Yù', 
    '医': 'Yī', '药': 'Yào', '康': 'Kāng', '治': 'Zhì', '护': 'Hù', '命': 'Mìng'
  };
  
  // 查找扩展映射
  if (pinyinData[char]) {
    return pinyinData[char];
  }
  
  // 如果所有映射都没找到，返回一个通用但有意义的拼音
  try {
    // 在实际项目中可以集成拼音库
    console.warn(`未能找到汉字"${char}"的拼音映射，使用通用拼音`);
    
    // 对于中文汉字范围的字符，返回一个友好的提示而不是默认"Zì"
    const codePoint = char.charCodeAt(0);
    if (codePoint >= 0x4e00 && codePoint <= 0x9fff) {
      // 记录未找到拼音的汉字，方便后续添加
      console.error(`缺少拼音定义: ${char}`);
      
      // 返回汉字本身而不是固定的"Zì"
      return `${char}`;
    }
    
    // 非汉字字符返回原始字符
    return char;
  } catch (error) {
    console.error(`处理字符"${char}"拼音时出错:`, error);
    return char; // 出错时返回字符本身而不是"Zì"
  }
};

// 确保汉字有正确的拼音
const hasPinyin = (char: string): boolean => {
  // 查找字符是否在各种字库中
  const inSurname = surnames.some(item => item.char === char);
  const inMale = maleNameChars.some(item => item.char === char);
  const inFemale = femaleNameChars.some(item => item.char === char);
  const inUnisex = unisexNameChars.some(item => item.char === char);
  
  // 检查获取拼音函数的结果
  const pinyin = getPinyin(char);
  const hasPinyinMapping = pinyin !== char && !pinyin.startsWith('Zi');
  
  return inSurname || inMale || inFemale || inUnisex || hasPinyinMapping;
};

// 验证所有汉字都有拼音定义
const validatePinyinDefinitions = () => {
  const allChars = new Set<string>();
  const missingPinyinChars: string[] = [];
  const missingPinyinDetails: Record<string, string[]> = {
    surname: [],
    male: [],
    female: [],
    unisex: [],
    wuxing: [],
    profession: []
  };
  
  // 收集所有姓氏字符
  surnames.forEach(item => {
    allChars.add(item.char);
    // 检查拼音
    const pinyin = getPinyin(item.char);
    if (pinyin === item.char) {
      missingPinyinDetails.surname.push(item.char);
    }
  });
  
  // 收集所有男性名字字符
  maleNameChars.forEach(item => {
    allChars.add(item.char);
    // 检查拼音
    const pinyin = getPinyin(item.char);
    if (pinyin === item.char) {
      missingPinyinDetails.male.push(item.char);
    }
  });
  
  // 收集所有女性名字字符
  femaleNameChars.forEach(item => {
    allChars.add(item.char);
    // 检查拼音
    const pinyin = getPinyin(item.char);
    if (pinyin === item.char) {
      missingPinyinDetails.female.push(item.char);
    }
  });
  
  // 收集所有中性名字字符
  unisexNameChars.forEach(item => {
    allChars.add(item.char);
    // 检查拼音
    const pinyin = getPinyin(item.char);
    if (pinyin === item.char) {
      missingPinyinDetails.unisex.push(item.char);
    }
  });
  
  // 收集五行元素中的字符
  Object.values(wuXing).forEach(element => {
    element.chars.forEach(char => {
      allChars.add(char);
      // 检查拼音
      const pinyin = getPinyin(char);
      if (pinyin === char) {
        missingPinyinDetails.wuxing.push(char);
      }
    });
  });
  
  // 收集职业类别中的字符
  Object.values(professionCategories).forEach(category => {
    category.chars.forEach(char => {
      allChars.add(char);
      // 检查拼音
      const pinyin = getPinyin(char);
      if (pinyin === char) {
        missingPinyinDetails.profession.push(char);
      }
    });
  });
  
  // 检查每个字符是否有拼音定义
  allChars.forEach(char => {
    // 使用已存在的getPinyin函数检查拼音，而不是检查pinyinData
    const pinyin = getPinyin(char);
    // 检查拼音是否是字符本身（表示没有找到拼音）
    if (pinyin === char) {
      missingPinyinChars.push(char);
    }
  });
  
  // 输出缺少拼音定义的字符
  if (missingPinyinChars.length > 0) {
    console.error(`缺少拼音定义的汉字: ${missingPinyinChars.join(', ')}`);
    
    // 输出详细信息
    Object.entries(missingPinyinDetails).forEach(([category, chars]) => {
      if (chars.length > 0) {
        console.error(`${category}类别中缺少拼音的字符: ${chars.join(', ')}`);
      }
    });
  } else {
    console.log('所有汉字都有拼音定义');
  }
  
  return missingPinyinChars.length === 0;
};

// 在导出函数前调用验证函数
validatePinyinDefinitions();

// 测试姓氏匹配功能
const testSurnameMatching = () => {
  const testCases = [
    'Jeff Lee',
    'Michael Wang',
    'John Smith',
    'Linda Chen',
    'David Li',
    'Jane Wilson',
    'Thomas Yang',
    'Jennifer Wu'
  ];
  
  console.log('--------- 姓氏匹配测试 ---------');
  testCases.forEach(name => {
    const matchedSurname = findSimilarSurname(name);
    console.log(`${name} => ${matchedSurname.char} (${matchedSurname.pinyin})`);
  });
  console.log('-------------------------------');
};

// 运行测试
testSurnameMatching();

// 主函数：根据输入生成三个中文名字
export const generateNames = async (input: NameInput): Promise<GeneratedName[]> => {
  const { originalName, gender } = input;
  
  // 确保originalName不为空
  if (!originalName || originalName.trim() === '') {
    throw new Error('名字不能为空');
  }
  
  // 查找相似发音的姓氏
  const surname = findSimilarSurname(originalName);
  
  // 使用固定的五行属性（木）作为默认值
  const wuXingElement = "wood";
  
  // 使用默认的职业相关字符
  const professionChars = ['德', '智', '信', '和', '善', '勤', '诚'];
  
  // 选择适合性别的字符，并过滤掉没有拼音的字符
  const nameChars = gender === 'male' ? maleNameChars : femaleNameChars;
  const results: GeneratedName[] = [];
  
  // 生成单字名（基于五行）
  const wuXingChars = wuXing[wuXingElement as keyof typeof wuXing].chars
    .filter(char => hasPinyin(char));
  
  // 如果过滤后没有字符，使用默认字符
  if (wuXingChars.length === 0) {
    console.warn('五行相关字符过滤后为空，使用默认字符');
    // 选择五行对应的默认字符
    const defaultChars: Record<string, string[]> = {
      wood: ['木', '林', '华'],
      fire: ['火', '炎', '明'],
      earth: ['土', '地', '安'],
      metal: ['金', '铭', '刚'],
      water: ['水', '海', '清']
    };
    const defaultWuXingChars = defaultChars[wuXingElement] || ['德', '智', '信'];
    wuXingChars.push(...defaultWuXingChars);
  }
  
  const singleNameChar = wuXingChars[Math.floor(Math.random() * wuXingChars.length)];
  results.push(generateName(surname, singleNameChar, null, wuXingElement, "general", gender, originalName));
  
  // 生成双字名（组合五行和职业）
  const doubleNameChar1 = wuXingChars[Math.floor(Math.random() * wuXingChars.length)];
  const doubleNameChar2 = professionChars[Math.floor(Math.random() * professionChars.length)];
  results.push(generateName(surname, doubleNameChar1, doubleNameChar2, wuXingElement, "general", gender, originalName));
  
  // 生成特性名（基于性别特征）
  const filteredNameChars = nameChars.filter(item => hasPinyin(item.char)).map(item => item.char);
  const filteredUnisexChars = unisexNameChars.filter(item => hasPinyin(item.char)).map(item => item.char);
  
  // 如果过滤后没有字符，使用默认字符
  if (filteredNameChars.length === 0) {
    console.warn('性别相关字符过滤后为空，使用默认字符');
    filteredNameChars.push(gender === 'male' ? '勇' : '美');
  }
  
  if (filteredUnisexChars.length === 0) {
    console.warn('中性字符过滤后为空，使用默认字符');
    filteredUnisexChars.push('智', '华');
  }
  
  const specialNameChar = filteredNameChars[Math.floor(Math.random() * filteredNameChars.length)];
  const specialNameChar2 = filteredUnisexChars[Math.floor(Math.random() * filteredUnisexChars.length)];
  results.push(generateName(surname, specialNameChar, specialNameChar2, wuXingElement, "general", gender, originalName));
  
  return results;
}; 