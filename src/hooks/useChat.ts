import { useState } from 'react'
import { useSessionsStore, useActiveSession } from '../store/readingStore'
import { sendChatMessage } from '../lib/api'
import type { ChatMessage } from '../types'

export function useChat() {
  const { addChatMessage, setIsLoading, isLoading } = useSessionsStore()
  const session = useActiveSession()
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (text: string) => {
    if (!session?.result || !text.trim()) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    }
    addChatMessage(userMsg)
    setIsLoading(true)
    setError(null)

    try {
      const reply = await sendChatMessage(text, session.chatHistory, session.result, session.personalInfo)
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      }
      addChatMessage(assistantMsg)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    chatHistory: session?.chatHistory ?? [],
    sendMessage,
    isLoading,
    error,
  }
}
