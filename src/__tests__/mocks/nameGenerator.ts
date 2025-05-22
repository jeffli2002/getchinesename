// 此文件是模拟文件，不是测试文件
const { NameInput, GeneratedName } = require('@/types');

// 模拟名字生成函数
const generateNames = async (input) => {
  // 返回固定的测试数据
  return [
    {
      fullName: '李明',
      surname: '李',
      givenName: '明',
      pinyin: 'Li Ming',
      surnameMeaning: {
        en: 'Plum tree',
        fr: 'Prunier',
        zh: '李树'
      },
      givenNameMeaning: {
        en: 'This name carries masculine energy and wood element represents growth, creativity, and expansion. The character "明" was chosen for its powerful meaning and harmonious sound.',
        fr: 'Ce nom possède une énergie masculine et l\'élément bois représente la croissance, la créativité et l\'expansion. Le caractère "明" a été choisi pour sa signification puissante et son son harmonieux.',
        zh: '这个名字带有阳刚之气，木代表生长、创造和发展。字"明"因其有力的含义和和谐的声音而被选择。'
      },
      calligraphy: {
        kai: '',
        xing: ''
      },
      pronunciation: ''
    },
    {
      fullName: '李思远',
      surname: '李',
      givenName: '思远',
      pinyin: 'Li Si Yuan',
      surnameMeaning: {
        en: 'Plum tree',
        fr: 'Prunier',
        zh: '李树'
      },
      givenNameMeaning: {
        en: 'This name carries masculine energy and fire element represents passion, energy, and transformation. The first character "思" represents personal qualities, while "远" connects to your destiny and future.',
        fr: 'Ce nom possède une énergie masculine et l\'élément feu représente la passion, l\'énergie et la transformation. Le premier caractère "思" représente des qualités personnelles, tandis que "远" se connecte à votre destin et votre avenir.',
        zh: '这个名字带有阳刚之气，火代表热情、能量和转变。第一个字"思"代表个人品质，而"远"则与您的命运和未来相连。'
      },
      calligraphy: {
        kai: '',
        xing: ''
      },
      pronunciation: ''
    },
    {
      fullName: '王雅婷',
      surname: '王',
      givenName: '雅婷',
      pinyin: 'Wang Ya Ting',
      surnameMeaning: {
        en: 'King',
        fr: 'Roi',
        zh: '王者'
      },
      givenNameMeaning: {
        en: 'This name embodies feminine elegance and earth element represents stability, reliability, and nurturing. The first character "雅" represents personal qualities, while "婷" connects to your destiny and future.',
        fr: 'Ce nom incarne l\'élégance féminine et l\'élément terre représente la stabilité, la fiabilité et la protection. Le premier caractère "雅" représente des qualités personnelles, tandis que "婷" se connecte à votre destin et votre avenir.',
        zh: '这个名字体现女性优雅，土代表稳定、可靠和滋养。第一个字"雅"代表个人品质，而"婷"则与您的命运和未来相连。'
      },
      calligraphy: {
        kai: '',
        xing: ''
      },
      pronunciation: ''
    }
  ];
};

module.exports = {
  generateNames
}; 