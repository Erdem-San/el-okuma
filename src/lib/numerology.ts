// ─── Numeroloji ve Astroloji Hesaplama Motoru ─────────────────────────────────

export interface LifePathResult {
  number: number
  isMaster: boolean
  title: string
  keywords: string[]
  description: string
}

export interface ZodiacResult {
  sign: string
  symbol: string
  element: string
  modality: string
  ruler: string
  dateRange: string
  traits: string
}

export interface NameAnalysisResult {
  number: number
  isMaster: boolean
  meaning: string
}

// 1. Hayat Yolu Sayısı (Kader Sayısı) Hesaplayıcı
export function calculateLifePathNumber(day: number, month: number, year: number): LifePathResult {
  // Gün, ay ve yılın tüm rakamlarını topla
  const allDigits = `${day}${month}${year}`.split('').map(Number)
  let sum = allDigits.reduce((acc, digit) => acc + digit, 0)

  // 11, 22, 33 Üstat Sayılardır (İndirgenmez)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum)
      .split('')
      .map(Number)
      .reduce((acc, digit) => acc + digit, 0)
  }

  const isMaster = sum === 11 || sum === 22 || sum === 33

  const meanings: Record<number, { title: string; keywords: string[]; description: string }> = {
    1: {
      title: 'Öncü & Bağımsız Lider',
      keywords: ['Liderlik', 'Özgünlük', 'Cesaret', 'Girişimcilik'],
      description: 'Yeni yollar açan, kimseden emir almayı sevmeyen, doğuştan vizyoner ve öncü bir ruha sahipsiniz.',
    },
    2: {
      title: 'Uyum & Barış Elçisi',
      keywords: ['Diplomasi', 'Sezgi', 'Uyum', 'Duygusal Zeka'],
      description: 'Derin empati yeteneği olan, çatışmaları yatıştıran, ortaklıklarda ve ikili ilişkilerde parlayan bir enerjiniz var.',
    },
    3: {
      title: 'Yaratıcı İfade & İlham Kaynağı',
      keywords: ['Sanat', 'İletişim', 'Neşe', 'Kendini İfade'],
      description: 'Kelimelerle, sanatla ve insan ilişkileriyle dünyayı güzelleştiren, içsel ışığı yüksek bir yaratıcı güçsünüz.',
    },
    4: {
      title: 'Düzen & Sağlam Temeller Mimarı',
      keywords: ['Disiplin', 'Güvenilirlik', 'Çalışkanlık', 'Strateji'],
      description: 'Kaosu düzene sokan, sarsılmaz sistemler kuran, sözünün eri ve hedeflerine adım adım ulaşan bir yapınız var.',
    },
    5: {
      title: 'Özgür Gezgin & Değişim Öncüsü',
      keywords: ['Özgürlük', 'Macera', 'Merak', 'Adaptasyon'],
      description: 'Rutinlere hapsolamayan, dünyayı keşfetmek isteyen, değişimden beslenen ve çok yönlü bir zihne sahipsiniz.',
    },
    6: {
      title: 'Şefkatli Rehber & Koruyucu',
      keywords: ['Sorumluluk', 'Sevgi', 'Aile', 'Hizmet'],
      description: 'Çevresindekileri kollayan, adalet duygusu yüksek, güzellik ve huzur inşa eden bir koruyucusunuz.',
    },
    7: {
      title: 'Derin Bilge & Gizem Arayıcısı',
      keywords: ['Analiz', 'İçgörü', 'Yalnızlık', 'Maneviyat'],
      description: 'Yüzeysel olan hiçbir şeyle tatmin olmayan, hakikatin ve sırların peşinden koşan filozof bir ruha sahipsiniz.',
    },
    8: {
      title: 'Güç, Bolluk & İrade Yöneticisi',
      keywords: ['Başarı', 'Maddi Güç', 'Otorite', 'Büyük Vizyon'],
      description: 'Büyük ölçekli işleri yönetme kapasitesi olan, kararlı, dünyevi başarıyı ve adaleti dengeleyen bir lidersiniz.',
    },
    9: {
      title: 'Evrensel İnsancıl & Bilge Ruh',
      keywords: ['Merhamet', 'Tamamlanma', 'Fedakarlık', 'Yüksek Bilinç'],
      description: 'Bireysel çıkarların ötesine geçmiş, dünyayı daha iyi bir yer yapmaya adanmış yaşlı ve derin bir ruha sahipsiniz.',
    },
    11: {
      title: 'Aydınlanmış Sezgi & İlham Üstadı (Master 11)',
      keywords: ['Yüksek Sezgi', 'Manevi Öncü', 'Ruhsal Işık'],
      description: 'Maddi dünya ile manevi alemler arasında bir köprü görevi gören, çok güçlü önsezi ve psişik farkındalığa sahip üstat bir titreşimdir.',
    },
    22: {
      title: 'Usta İnşaatçı & Büyük Vizyoner (Master 22)',
      keywords: ['Küresel Başarı', 'Dönüştürücü Güç', 'Somut Deha'],
      description: 'En imkansız görünen hayalleri bile yeryüzünde somut projelere ve sistemlere dönüştürme potansiyeli taşıyan en güçlü sayıdır.',
    },
    33: {
      title: 'Evrensel Şefkat & Kozmik Rehber (Master 33)',
      keywords: ['Saf Sevgi', 'Toplumsal Şifa', 'Kozmik Öğreti'],
      description: 'İnsanlığa koşulsuz sevgiyle rehberlik eden, kendini başkalarının aydınlanmasına adamış en yüksek frekanslı üstat sayıdır.',
    },
  }

  const meaning = meanings[sum] || meanings[4]

  return {
    number: sum,
    isMaster,
    title: meaning.title,
    keywords: meaning.keywords,
    description: meaning.description,
  }
}

// 2. Güneş Burcu Hesaplayıcı
export function calculateZodiacSign(day: number, month: number): ZodiacResult {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return {
      sign: 'Koç',
      symbol: '♈',
      element: 'Ateş',
      modality: 'Öncü',
      ruler: 'Mars',
      dateRange: '21 Mart - 19 Nisan',
      traits: 'Cesur, tutkulu, kararlı ve eylem odaklı bir lider.',
    }
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return {
      sign: 'Boğa',
      symbol: '♉',
      element: 'Toprak',
      modality: 'Sabit',
      ruler: 'Venüs',
      dateRange: '20 Nisan - 20 Mayıs',
      traits: 'Güvenilir, estetik zevki yüksek, sabırlı ve sadık.',
    }
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return {
      sign: 'İkizler',
      symbol: '♊',
      element: 'Hava',
      modality: 'Değişken',
      ruler: 'Merkür',
      dateRange: '21 Mayıs - 20 Haziran',
      traits: 'Zeki, meraklı, hızlı kavrayan ve iletişim ustası.',
    }
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return {
      sign: 'Yengeç',
      symbol: '♋',
      element: 'Su',
      modality: 'Öncü',
      ruler: 'Ay',
      dateRange: '21 Haziran - 22 Temmuz',
      traits: 'Derin sezgili, koruyucu, duygusal hafızası güçlü.',
    }
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return {
      sign: 'Aslan',
      symbol: '♌',
      element: 'Ateş',
      modality: 'Sabit',
      ruler: 'Güneş',
      dateRange: '23 Temmuz - 22 Ağustos',
      traits: 'Cömert, karizmatik, yaratıcı ve doğal bir sahnede parlayan güç.',
    }
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return {
      sign: 'Başak',
      symbol: '♍',
      element: 'Toprak',
      modality: 'Değişken',
      ruler: 'Merkür',
      dateRange: '23 Ağustos - 22 Eylül',
      traits: 'Titiz, analitik, pratik zekalı ve mükemmeliyetçi.',
    }
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return {
      sign: 'Terazi',
      symbol: '♎',
      element: 'Hava',
      modality: 'Öncü',
      ruler: 'Venüs',
      dateRange: '23 Eylül - 22 Ekim',
      traits: 'Adil, zarif, diplomasi dehası ve denge arayıcısı.',
    }
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return {
      sign: 'Akrep',
      symbol: '♏',
      element: 'Su',
      modality: 'Sabit',
      ruler: 'Plüton & Mars',
      dateRange: '23 Ekim - 21 Kasım',
      traits: 'Manyetik, tutkulu, gizemli ve küllerinden yeniden doğan.',
    }
  }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return {
      sign: 'Yay',
      symbol: '♐',
      element: 'Ateş',
      modality: 'Değişken',
      ruler: 'Jüpiter',
      dateRange: '22 Kasım - 21 Aralık',
      traits: 'İyimser, felsefi, özgürlük aşığı ve vizyoner gezgin.',
    }
  }
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return {
      sign: 'Oğlak',
      symbol: '♑',
      element: 'Toprak',
      modality: 'Öncü',
      ruler: 'Satürn',
      dateRange: '22 Aralık - 19 Ocak',
      traits: 'Stratejik, azimli, dağları tırmanan disiplin ve otorite.',
    }
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return {
      sign: 'Kova',
      symbol: '♒',
      element: 'Hava',
      modality: 'Sabit',
      ruler: 'Uranüs & Satürn',
      dateRange: '20 Ocak - 18 Şubat',
      traits: 'Özgün, hümanist, çağı aşan zeka ve bağımsız.',
    }
  }
  return {
    sign: 'Balık',
    symbol: '♓',
    element: 'Su',
    modality: 'Değişken',
    ruler: 'Neptün & Jüpiter',
    dateRange: '19 Şubat - 20 Mart',
    traits: 'Ruhsal, empatik, sınırsız hayal gücü ve derin bilgelik.',
  }
}

// 3. Pisagor İsim Sayısı Hesaplayıcı (İsim Kader Sayısı)
const PYTHAGOREAN_TABLE: Record<string, number> = {
  A: 1, J: 1, S: 1, Ş: 1,
  B: 2, K: 2, T: 2,
  C: 3, Ç: 3, L: 3, U: 3, Ü: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, Ö: 6, X: 6,
  G: 7, Ğ: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, İ: 9, R: 9,
}

export function calculateNameDestinyNumber(fullName: string): NameAnalysisResult {
  const clean = fullName.toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ]/g, '')
  if (!clean) return { number: 1, isMaster: false, meaning: 'İsim enerjisi analiz ediliyor.' }

  let sum = 0
  for (const char of clean) {
    sum += PYTHAGOREAN_TABLE[char] || 0
  }

  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0)
  }

  const isMaster = sum === 11 || sum === 22

  return {
    number: sum,
    isMaster,
    meaning: `İsminizin yaydığı baskın frekans ${sum} titreşimidir. Bu titreşim, dış dünyada nasıl algılandığınızı ve karakterinizin çekim merkezini belirler.`,
  }
}
