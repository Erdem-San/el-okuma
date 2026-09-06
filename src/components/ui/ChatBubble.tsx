import type { ChatMessage } from '../../types'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, var(--bg-card2), var(--bg-card))', border: '1px solid var(--border-gold)' }}
        >
          🔮
        </div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--cream)' }}>
          {message.content}
        </p>
        <p className="text-right mt-1" style={{ color: 'var(--cream-dim)', fontSize: 10, opacity: 0.5 }}>
          {new Date(message.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--bg-card2), var(--bg-card))', border: '1px solid var(--border-gold)' }}
      >
        🔮
      </div>
      <div className="chat-bubble-ai flex items-center gap-1.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--gold)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
