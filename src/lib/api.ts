import type { PersonalInfo, HandPhoto, ReadingResult, ChatMessage } from '../types'
import { PALM_READING_SYSTEM_PROMPT } from './constants'
import { stripBase64Prefix } from './imageUtils'
import { useAdminStore } from '../store/adminStore'

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('VITE_GEMINI_KEY ortam değişkeni tanımlı değil. .env.local dosyanıza ekleyin.')
  return key
}

// ─── Otomatik Model Keşfi ve Fallback Sistemi ────────────────────────────────
let cachedWorkingModel: { model: string; apiVer: string } | null = null

const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash-001',
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
          throw err
        }
        lastError = message
      }
    }
  }

  throw new Error(`Kullanılabilir bir Gemini modeli bulunamadı (404). Son yanıt: ${lastError}`)
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
    ? `\nÖNEMLİ: Ekte verilen ${adminDocs.length} adet "el falı rehberi" PDF belgesindeki (Cheiro ve Benham ekolü) kuralları tek ve mutlak referans kaynağı olarak baz al. Buradaki çizgiler, tepeler, yaş hesaplama formülleri ve işaret yorumlarını harfiyen uygula.\n`
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

  const data = await requestGemini(body, apiKey)
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
    ? `\nEkte verilen "el falı rehberi" PDF belgelerindeki bilgileri (Cheiro & Benham) temel alarak soruları cevapla.\n`
    : ''

  const systemText = `
${PALM_READING_SYSTEM_PROMPT}
${docInstruction}
Kullanıcı: ${personalInfo.firstName} ${personalInfo.lastName}, ${personalInfo.age} yaşında.
Daha önce yapılan el falı okuma özeti: ${result.summary}

Artık kullanıcının takip sorularını yanıtlıyorsun. Önceki analiz bağlamını ve el çizgisi tespitlerini harfiyen koru.
Kullanıcının yaşını, hayallerini ve çizgilerindeki tarihleri göz önünde bulundur.
Türkçe, bilgece, mistik ve doğrudan yüzleştirici bir dille konuş.
`

  const docParts = adminDocs.map((d) => ({
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
