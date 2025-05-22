export interface NameInput {
  originalName: string;
  gender: 'male' | 'female';
}

export interface GeneratedName {
  fullName: string;
  surname: string;
  givenName: string;
  pinyin: string;
  surnameMeaning: {
    en: string;
    fr: string;
    zh: string;
  };
  givenNameMeaning: {
    en: string;
    fr: string;
    zh: string;
  };
  calligraphy: {
    kai: string;
    xing: string;
  };
  pronunciation: string;
  originalName: string;
  nameRelation?: {
    phoneticSimilarity: string;
    meaningConnection: string;
    culturalContext: string;
  };
}

export interface Testimonial {
  id: number;
  name: string;
  role: {
    en: string;
    fr: string;
  };
  content: {
    en: string;
    fr: string;
  };
  image: string;
}

export interface FAQ {
  id: number;
  question: {
    en: string;
    fr: string;
  };
  answer: {
    en: string;
    fr: string;
  };
} 