import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, X, ArrowUp, Sparkles, RefreshCw, WifiOff } from 'lucide-react'
import { useCompare } from '../../lib/CompareContext'
import { useCurrency } from '../../lib/CurrencyContext'
import { sendChatMessage } from '../../lib/chatApi'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'vintage_chat_messages'

const COLORS = {
  dark: '#0C0A08',
  panel: '#1A1410',
  gold: '#B08D57',
  goldGrad: 'linear-gradient(135deg, #B08D57, #C9A96E)',
  cream: '#F0E6D6',
  creamDim: 'rgba(240, 230, 214, 0.5)',
  creamFaint: 'rgba(240, 230, 214, 0.25)',
  border: 'rgba(176, 141, 87, 0.15)',
  borderGold: 'rgba(176, 141, 87, 0.3)',
  userBg: 'rgba(176, 141, 87, 0.12)',
  userBorder: 'rgba(176, 141, 87, 0.2)',
  botBg: 'rgba(240, 230, 214, 0.04)',
  botBorder: 'rgba(240, 230, 214, 0.08)',
}

const QUICK_REPLIES = [
  'Ищу подарок',
  'Для интерьера',
  'Украшения',
  'Одежда и аксессуары',
]

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  text: 'Здравствуйте! Я консультант Galerie du Temps.\nПомогу подобрать идеальную винтажную вещь. Чем могу помочь?',
  timestamp: Date.now(),
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-lg w-fit" style={{ backgroundColor: COLORS.botBg, border: `1px solid ${COLORS.botBorder}` }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="chat-typing-dot w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: COLORS.creamDim }}
        />
      ))}
    </div>
  )
}

function ProductMiniCard({ product }) {
  const { formatPrice } = useCurrency()
  const img = product.image_url || product.images?.[0]?.url

  return (
    <Link
      to={`/product/${product.id}`}
      className="flex-shrink-0 w-32 rounded overflow-hidden transition-all duration-300 hover:scale-[1.03]"
      style={{ backgroundColor: COLORS.panel, border: `1px solid ${COLORS.border}` }}
    >
      {img && (
        <div className="aspect-square overflow-hidden">
          <img src={img} alt={product.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-2">
        <p className="font-body text-[11px] leading-tight" style={{ color: COLORS.cream, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.title}
        </p>
        <p className="font-display text-sm mt-1" style={{ color: COLORS.gold }}>
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
      <div
        className="max-w-[85%] px-4 py-2.5 rounded-xl"
        style={{
          backgroundColor: isUser ? COLORS.userBg : COLORS.botBg,
          border: `1px solid ${isUser ? COLORS.userBorder : COLORS.botBorder}`,
          borderBottomRightRadius: isUser ? '4px' : undefined,
          borderBottomLeftRadius: !isUser ? '4px' : undefined,
        }}
      >
        <p className="font-body text-sm leading-relaxed whitespace-pre-line" style={{ color: isUser ? COLORS.cream : COLORS.creamDim }}>
          {msg.text}
        </p>
      </div>

      {msg.products?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full" style={{ scrollbarWidth: 'none' }}>
          {msg.products.map(p => (
            <ProductMiniCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {msg.fallback && (
        <div className="flex items-center gap-1 mt-0.5">
          <WifiOff size={10} style={{ color: COLORS.creamFaint }} />
          <span className="font-body text-[9px]" style={{ color: COLORS.creamFaint }}>
            Офлайн-режим
          </span>
        </div>
      )}
    </div>
  )
}

function ChatHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: COLORS.goldGrad }}
        >
          <Sparkles size={14} color={COLORS.dark} />
        </div>
        <div>
          <p className="font-display text-sm tracking-wide" style={{ color: COLORS.gold }}>
            Galerie du Temps
          </p>
          <p className="font-body text-[10px]" style={{ color: COLORS.creamFaint }}>
            AI-Консультант
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/5"
        style={{ color: COLORS.creamDim }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

function ChatInput({ value, onChange, onSend, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-3" style={{ borderTop: `1px solid ${COLORS.border}`, backgroundColor: COLORS.panel }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Напишите сообщение..."
        disabled={disabled}
        className="flex-1 bg-transparent font-body text-sm outline-none"
        style={{ color: COLORS.cream }}
        aria-label="Сообщение"
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: value.trim() ? COLORS.goldGrad : 'rgba(176, 141, 87, 0.15)',
          color: value.trim() ? COLORS.dark : COLORS.creamFaint,
          cursor: value.trim() && !disabled ? 'pointer' : 'default',
        }}
      >
        <ArrowUp size={16} />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const messagesEndRef = useRef(null)
  const { compareItems } = useCompare()
  const hasCompareBar = compareItems.length > 0

  // Restore messages from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) setMessages(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  // Save messages to sessionStorage
  useEffect(() => {
    if (messages.length > 1) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch { /* ignore */ }
    }
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || isLoading) return

    setInput('')
    setHasError(false)

    const userMsg = { id: Date.now().toString(), role: 'user', text: msg, timestamp: Date.now() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsLoading(true)

    const chatHistory = updatedMessages
      .filter(m => m.role !== 'system' && m.id !== 'welcome')
      .map(m => ({ role: m.role, text: m.text }))

    const { reply, products, error, fallback } = await sendChatMessage(chatHistory)

    if (error || !reply) {
      setHasError(true)
      setIsLoading(false)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: error || 'Извините, произошла ошибка. Попробуйте ещё раз.',
        timestamp: Date.now(),
      }])
      return
    }

    setIsLoading(false)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      text: reply,
      products: products || [],
      timestamp: Date.now(),
      fallback: fallback || false,
    }])
  }, [input, isLoading, messages])

  const handleRetry = () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (lastUser) {
      // Remove the error response
      setMessages(prev => prev.slice(0, -1))
      handleSend(lastUser.text)
    }
  }

  const handleClearChat = () => {
    setMessages([WELCOME_MSG])
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const userMessageCount = messages.filter(m => m.role === 'user').length
  const showQuickReplies = userMessageCount === 0

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          style={{
            right: '24px',
            bottom: hasCompareBar ? '84px' : '24px',
            background: COLORS.goldGrad,
            boxShadow: '0 4px 24px rgba(176, 141, 87, 0.4)',
          }}
          aria-label="Открыть чат-консультант"
        >
          <MessageCircle size={22} color={COLORS.dark} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="chat-panel-enter fixed z-50 flex flex-col overflow-hidden"
          style={{
            backgroundColor: COLORS.dark,
            border: `1px solid ${COLORS.borderGold}`,
            borderRadius: '12px',
            right: '24px',
            bottom: hasCompareBar ? '84px' : '24px',
            width: '380px',
            maxHeight: 'calc(100vh - 120px)',
            height: '520px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
          }}
          role="dialog"
          aria-label="Чат с консультантом"
        >
          <ChatHeader onClose={() => setIsOpen(false)} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            {messages.map(msg => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}

            {showQuickReplies && (
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map(qr => (
                  <button
                    key={qr}
                    onClick={() => handleSend(qr)}
                    className="font-body text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(176, 141, 87, 0.1)',
                      border: `1px solid ${COLORS.userBorder}`,
                      color: COLORS.gold,
                    }}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {isLoading && <TypingIndicator />}

            {hasError && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-full transition-colors hover:bg-white/5"
                style={{ color: COLORS.creamDim, border: `1px solid ${COLORS.botBorder}` }}
              >
                <RefreshCw size={12} />
                Повторить
              </button>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer: clear + input */}
          <div>
            {userMessageCount > 2 && (
              <div className="px-4 pb-1">
                <button
                  onClick={handleClearChat}
                  className="font-body text-[10px] tracking-wider uppercase transition-colors hover:underline"
                  style={{ color: COLORS.creamFaint }}
                >
                  Очистить чат
                </button>
              </div>
            )}
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => handleSend()}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Mobile fullscreen override */}
      <style>{`
        @media (max-width: 639px) {
          .chat-panel-enter {
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  )
}
