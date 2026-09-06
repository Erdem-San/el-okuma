import type { PersonalInfo, HandPhoto, ReadingResult, ChatMessage } from '../types'
import { GEMINI_API_BASE, GEMINI_MODEL, PALM_READING_SYSTEM_PROMPT } from './constants'
import { stripBase64Prefix } from './imageUtils'
import { useAdminStore } from '../store/adminStore'

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('VITE_GEMINI_KEY ortam değişkeni tanımlı değil. .env.local dosyanıza ekleyin.')
  return key
}

// ─── Palm Reading Analysis ───────────────────────────────────────────────────

export async function analyzePalmReading(
  personalInfo: PersonalInfo,
  photos: HandPhoto[],
  selfIntro: string,
): Promise<ReadingResult> {
  const apiKey = getApiKey()
  const adminDocs = useAdminStore.getState().docs

  const validPhotos = photos.filter((p) => p.base64)

  const docInstruction = adminDocs.length > 0
    ? `\nÖNEMLİ: Ekte verilen ${adminDocs.length} adet "el falı rehberi" PDF belgesini tek ve mutlak referans kaynağı olarak baz al. Buradaki kurallar, çizgiler ve işaret yorumlarını harfiyen uygula.\n`
    : ''

  const userPrompt = `
Kullanıcı Bilgileri:
- Ad Soyad: ${personalInfo.firstName} ${personalInfo.lastName}
- Yaş: ${personalInfo.age}
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

  const docParts = adminDocs.map((d) => ({
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

  const res = await fetch(
    `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API hatası: ${res.status} ${err}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('Gemini boş yanıt döndürdü.')

  try {
    return JSON.parse(text) as ReadingResult
  } catch {
    throw new Error('Yanıt JSON olarak ayrıştırılamadı: ' + text)
  }
}

// ─── Chat ───────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  userMessage: string,
  chatHistory: ChatMessage[],
  result: ReadingResult,
  personalInfo: PersonalInfo,
): Promise<string> {
  const apiKey = getApiKey()
  const adminDocs = useAdminStore.getState().docs

  const docInstruction = adminDocs.length > 0
    ? `\nEkte verilen "el falı rehberi" PDF belgelerindeki bilgileri temel alarak soruları cevapla.\n`
    : ''

  const systemText = `
${PALM_READING_SYSTEM_PROMPT}
${docInstruction}
Kullanıcı: ${personalInfo.firstName} ${personalInfo.lastName}, ${personalInfo.age} yaşında.
Daha önce yapılan el falı okuma özeti: ${result.summary}

Artık kullanıcının takip sorularını yanıtlıyorsun. Önceki analiz bağlamını koru.
Türkçe, mistik ve sıcak bir dille konuş.
`

  const docParts = adminDocs.map((d) => ({
    inlineData: {
      mimeType: d.mimeType || 'application/pdf',
      data: stripBase64Prefix(d.base64),
    },
  }))

  const contents = [
    // Inject previous analysis and docs as context
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
    // Chat history
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

  const res = await fetch(
    `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API hatası: ${res.status} ${err}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Boş yanıt')
  return text
}
