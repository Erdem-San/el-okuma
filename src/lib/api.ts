import type {
  PersonalInfo,
  HandPhoto,
  ReadingResult,
  ChatMessage,
  HoroscopeResult,
} from '../types'
import { PALM_READING_SYSTEM_PROMPT, HOROSCOPE_SYSTEM_PROMPT } from './constants'
import { stripBase64Prefix } from './imageUtils'
import { useAdminStore } from '../store/adminStore'
import {
  calculateLifePathNumber,
  calculateZodiacSign,
  calculateNameDestinyNumber,
} from './numerology'

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('VITE_GEMINI_KEY ortam değişkeni tanımlı değil. .env.local dosyanıza ekleyin.')
  return key
}

// ─── Otomatik Model Keşfi ve Fallback Sistemi ────────────────────────────────
let cachedWorkingModel: { model: string; apiVer: string } | null = null

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
]

async function requestGemini(body: unknown, apiKey: string): Promise<any> {
  const modelsToTry = cachedWorkingModel
    ? [cachedWorkingModel.model, ...CANDIDATE_MODELS.filter((m) => m !== cachedWorkingModel?.model)]
    : CANDIDATE_MODELS

  let lastError = ''

  for (const model of modelsToTry) {
    const versions = cachedWorkingModel?.model === model ? [cachedWorkingModel.apiVer] : ['v1beta', 'v1']
    for (const apiVer of versions) {
      const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (res.status === 404) {
          lastError = await res.text()
          continue // Bu model veya sürüm bulunamadı, bir sonrakini dene
        }

        if (res.status === 503 || res.status === 429 || res.status >= 500) {
          // Model geçici yoğunlukta veya kota sınırında -> Hemen yedek modele geç!
          console.warn(`${model} yoğunlukta (${res.status}), sıradaki yedek modele geçiliyor...`)
          cachedWorkingModel = null
          lastError = await res.text()
          continue
        }

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Gemini API hatası (${res.status}): ${err}`)
        }

        const data = await res.json()
        cachedWorkingModel = { model, apiVer }
        return data
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('Gemini API hatası')) {
          if (!message.includes('(503)') && !message.includes('(429)') && !message.includes('(500)')) {
            throw err
          }
        }
        lastError = message
      }
    }
  }

  throw new Error(`Tüm modeller denendi ancak yanıt alınamadı. Son yanıt: ${lastError}`)
}

// ─── 1. Palm Reading (El Falı) Analizi ─────────────────────────────────────────

export async function analyzePalmReading(
  personalInfo: PersonalInfo,
  photos: HandPhoto[],
  selfIntro: string,
): Promise<ReadingResult> {
  const apiKey = getApiKey()
  // YALNIZCA El Falı belgelerini gönder (token ve kategori izolasyonu)
  const palmDocs = useAdminStore.getState().docs.filter((d) => d.category === 'palm' || !d.category)

  const validPhotos = photos.filter((p) => p.base64)

  const docInstruction = palmDocs.length > 0
    ? `\nÖNEMLİ: Ekte verilen ${palmDocs.length} adet "el falı rehberi" PDF belgesindeki (Cheiro ve Benham ekolü) kuralları tek ve mutlak referans kaynağı olarak baz al. Buradaki çizgiler, tepeler, yaş hesaplama formülleri ve işaret yorumlarını harfiyen uygula.\n`
    : ''

  const birthDateStr = personalInfo.birthDate
    ? `${personalInfo.birthDate.day}.${personalInfo.birthDate.month}.${personalInfo.birthDate.year}`
    : ''

  const userPrompt = `
Kullanıcı Bilgileri:
- Ad Soyad: ${personalInfo.firstName} ${personalInfo.lastName}
- Yaş: ${personalInfo.age}${birthDateStr ? ` (Doğum Tarihi: ${birthDateStr})` : ''}
- Kendinden bahsetti: ${selfIntro || 'Ek bilgi paylaşmadı.'}
${docInstruction}
Yüklenen ${validPhotos.length} adet el fotoğrafını analiz et.
${validPhotos.map((p) => `- ${p.label}`).join('\n')}

Lütfen kapsamlı bir el falı oku ve sadece JSON formatında yanıt ver.
`

  const photoParts = validPhotos.map((p) => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: stripBase64Prefix(p.base64!),
    },
  }))

  const docParts = palmDocs.map((d) => ({
    inlineData: {
      mimeType: d.mimeType || 'application/pdf',
      data: stripBase64Prefix(d.base64),
    },
  }))

  const body = {
    system_instruction: {
      parts: [{ text: PALM_READING_SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          ...docParts,
          ...photoParts,
          { text: userPrompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  }

  const data = await requestGemini(body, apiKey)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('Gemini boş yanıt döndürdü.')

  try {
    return JSON.parse(text) as ReadingResult
  } catch {
    throw new Error('Yanıt JSON olarak ayrıştırılamadı: ' + text)
  }
}

// ─── 2. Burç, Numeroloji & İsim Analizi ───────────────────────────────────────

export async function analyzeHoroscope(
  personalInfo: PersonalInfo,
  selfIntro: string,
): Promise<HoroscopeResult> {
  const apiKey = getApiKey()
  // YALNIZCA Burç/Astroloji/Numeroloji belgelerini gönder
  const horoscopeDocs = useAdminStore.getState().docs.filter((d) => d.category === 'horoscope')

  const day = Number(personalInfo.birthDate?.day || 1)
  const month = Number(personalInfo.birthDate?.month || 1)
  const year = Number(personalInfo.birthDate?.year || 1995)
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`

  // Kesin matematiksel algoritmalar
  const zodiac = calculateZodiacSign(day, month)
  const lifePath = calculateLifePathNumber(day, month, year)
  const nameDestiny = calculateNameDestinyNumber(fullName)

  const docInstruction = horoscopeDocs.length > 0
    ? `\nÖNEMLİ: Ekte verilen ${horoscopeDocs.length} adet "burç, astroloji ve numeroloji rehberi" PDF belgesindeki bilgileri temel referans al.\n`
    : ''

  const userPrompt = `
Kullanıcı ve Kozmik Hesaplama Verileri:
- Ad Soyad: ${fullName}
- Doğum Tarihi: ${day}.${month}.${year}
- Doğum Saati: ${personalInfo.birthTime ? personalInfo.birthTime : 'Belirtilmedi (Güneş burcu ve numeroloji baz alınacak)'}
- Hesaplanan Güneş Burcu: ${zodiac.sign} (${zodiac.symbol} - ${zodiac.element} Elementi, ${zodiac.modality}, Yönetici: ${zodiac.ruler})
- Hesaplanan Hayat Yolu Sayısı (Kader Sayısı): ${lifePath.number} (${lifePath.title}) ${lifePath.isMaster ? '[ÜSTAT SAYI]' : ''}
- İsim Analizi Kader Sayısı: ${nameDestiny.number}
- Kişinin Yaşamı / Merak Ettikleri Hakkında Ek Notu: ${selfIntro || 'Ek bilgi paylaşmadı.'}
${docInstruction}
Lütfen Güneş burcu, Hayat Yolu Sayısı ve İsim frekansını birleştirerek derin, bilgece ve somut bir rapor hazırla. Sadece JSON formatında yanıt ver.
`

  const docParts = horoscopeDocs.map((d) => ({
    inlineData: {
      mimeType: d.mimeType || 'application/pdf',
      data: stripBase64Prefix(d.base64),
    },
  }))

  const body = {
    system_instruction: {
      parts: [{ text: HOROSCOPE_SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          ...docParts,
          { text: userPrompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  }

  const data = await requestGemini(body, apiKey)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('Gemini boş yanıt döndürdü.')

  try {
    const parsed = JSON.parse(text)
    return {
      zodiacSign: zodiac.sign,
      zodiacElement: zodiac.element,
      lifePathNumber: lifePath.number,
      isMasterNumber: lifePath.isMaster,
      lifePathTitle: lifePath.title,
      nameDestinyNumber: nameDestiny.number,
      headline: parsed.headline || `${zodiac.sign} & Sayı ${lifePath.number} Kozmik Portresi`,
      summary: parsed.summary || `${fullName} için hazırlanan astro-numerolojik analiz.`,
      sections: parsed.sections || [],
    } as HoroscopeResult
  } catch {
    throw new Error('Yanıt JSON olarak ayrıştırılamadı: ' + text)
  }
}

// ─── 3. El Falı Sohbeti ───────────────────────────────────────────────────────

export async function sendChatMessage(
  userMessage: string,
  chatHistory: ChatMessage[],
  result: ReadingResult,
  personalInfo: PersonalInfo,
): Promise<string> {
  const apiKey = getApiKey()
  const palmDocs = useAdminStore.getState().docs.filter((d) => d.category === 'palm' || !d.category)

  const docInstruction = palmDocs.length > 0
    ? `\nEkte verilen "el falı rehberi" PDF belgelerindeki bilgileri (Cheiro & Benham) temel alarak soruları cevapla.\n`
    : ''

  const systemText = `Sen Cheiro ve Benham ekolünü benimsemiş bilge bir el falı danışmanısın.
${docInstruction}
Kullanıcı: ${personalInfo.firstName} ${personalInfo.lastName}, ${personalInfo.age} yaşında.
Daha önce yapılan el falı okuma özeti: ${result.summary}
Detaylı analiz başlıkları: ${result.sections.map(s => `${s.title}: ${s.content}`).join(' | ')}

KULLANICININ SORULARINA CEVAP VERİRKEN:
- KESİNLİKLE JSON KODU DÖNDÜRME! Normal, akıcı, sıcak ve bilgece bir sohbet diliyle Türkçe konuş.
- Kullanıcının sorduğu soruları, el çizgilerindeki işaretlerle ve paylaştığı hayat detaylarıyla bağdaştırarak açıkla.
- Geçmiş analiz bağlamını koru.`

  const docParts = palmDocs.map((d) => ({
    inlineData: {
      mimeType: d.mimeType || 'application/pdf',
      data: stripBase64Prefix(d.base64),
    },
  }))

  const contents = [
    {
      role: 'user',
      parts: [
        ...docParts,
        { text: 'Bu benim el falı okumam için rehber belgeler.' },
      ],
    },
    {
      role: 'model',
      parts: [{ text: `Rehber belgeleri inceledim. El okuman tamamlandı: ${result.summary}` }],
    },
    ...chatHistory.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ]

  const body = {
    system_instruction: { parts: [{ text: systemText }] },
    contents,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 2048,
    },
  }

  const data = await requestGemini(body, apiKey)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Boş yanıt')
  return text
}

// ─── 4. Burç & Numeroloji Sohbeti ───────────────────────────────────────────

export async function sendHoroscopeChatMessage(
  userMessage: string,
  chatHistory: ChatMessage[],
  result: HoroscopeResult,
  personalInfo: PersonalInfo,
): Promise<string> {
  const apiKey = getApiKey()
  const horoscopeDocs = useAdminStore.getState().docs.filter((d) => d.category === 'horoscope')

  const docInstruction = horoscopeDocs.length > 0
    ? `\nEkte verilen "astroloji ve numeroloji rehberi" PDF belgelerindeki bilgileri temel alarak soruları cevapla.\n`
    : ''

  const systemText = `Sen kadim Astroloji ve Numeroloji ilminin bilge bir danışmanısın.
${docInstruction}
Kullanıcı: ${personalInfo.firstName} ${personalInfo.lastName}
Güneş Burcu: ${result.zodiacSign} (${result.zodiacElement} elementi)
Hayat Yolu Sayısı: ${result.lifePathNumber} (${result.lifePathTitle})
İsim Kader Sayısı: ${result.nameDestinyNumber}
Daha önce yapılan rapor özeti: ${result.summary}
Detaylı analiz başlıkları: ${result.sections.map(s => `${s.title}: ${s.content}`).join(' | ')}

KULLANICININ SORULARINA CEVAP VERİRKEN:
- KESİNLİKLE JSON KODU DÖNDÜRME! Normal, akıcı, sıcak ve bilgece bir sohbet diliyle Türkçe konuş.
- Kullanıcının burcunu, Hayat Yolu Sayısını ve isminin harf frekanslarını referans alarak cevap ver.
- Önceden oluşturulan analiz bağlamını koru.`

  const docParts = horoscopeDocs.map((d) => ({
    inlineData: {
      mimeType: d.mimeType || 'application/pdf',
      data: stripBase64Prefix(d.base64),
    },
  }))

  const contents = [
    {
      role: 'user',
      parts: [
        ...docParts,
        { text: 'Bu benim burç ve numeroloji analizim için rehber belgeler.' },
      ],
    },
    {
      role: 'model',
      parts: [{ text: `Rehber belgeleri inceledim. Kozmik analiz tamamlandı: ${result.summary}` }],
    },
    ...chatHistory.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ]

  const body = {
    system_instruction: { parts: [{ text: systemText }] },
    contents,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 2048,
    },
  }

  const data = await requestGemini(body, apiKey)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Boş yanıt')
  return text
}
