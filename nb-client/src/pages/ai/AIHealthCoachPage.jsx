import React, { useState, useRef, useEffect } from 'react'
import { Send, Brain, User, Sparkles } from 'lucide-react'
import { aiApi }       from '../../api/aiApi'
import useAuthStore    from '../../store/authStore'

const SUGGESTIONS = [
  'What should I eat before my workout?',
  'How much protein do I need daily?',
  'Why am I not losing weight?',
  'Best post-workout meal for muscle gain?',
  'How many calories should I eat to bulk?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${isUser ? 'bg-[#f5c518]' : 'bg-[#1a1a1a] border border-[#242424]'}`}>
        {isUser
          ? <User size={15} className="text-black" />
          : <Brain size={15} className="text-[#f5c518]" />
        }
      </div>
      <div className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm
        leading-relaxed whitespace-pre-wrap
        ${isUser
          ? 'bg-[#f5c518] text-black rounded-tr-sm font-medium'
          : 'bg-[#161616] border border-[#1e1e1e] text-[#d1d5db] rounded-tl-sm'
        }`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AIHealthCoachPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hey! I'm NutriBot, your AI health coach powered by Qwen 2.5 AI. Ask me anything about nutrition, workouts, or your progress. Let's crush your goals 💪",
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)
  const { user }              = useAuthStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text = input) => {
    const content = text.trim()
    if (!content || loading) return
    setInput('')

    const updated = [...messages, { role: 'user', content }]
    setMessages(updated)
    setLoading(true)

    try {
      // POST /api/ai/chat  body: { message }  response: { success, reply }
      const { data } = await aiApi.chat(content)
      setMessages([...updated, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const errMsg = err.response?.data?.message || "Sorry, I'm having trouble right now. Try again."
      setMessages([...updated, { role: 'assistant', content: errMsg }])
    }
    setLoading(false)
    // Refocus input after response
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#1a1a1a]
        bg-[#0d0d0d] shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#f5c51812] border border-[#f5c51830]
          flex items-center justify-center">
          <Brain size={20} className="text-[#f5c518]" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-white leading-none">NUTRIBOT</h1>
          <p className="text-xs text-[#22c55e] font-condensed flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse inline-block" />
            Powered by Qwen 2.5 AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#242424]
              flex items-center justify-center shrink-0">
              <Brain size={15} className="text-[#f5c518]" />
            </div>
            <div className="bg-[#161616] border border-[#1e1e1e] rounded-2xl rounded-tl-sm
              px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-[#f5c518] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only on first message */}
      {messages.length === 1 && !loading && (
        <div className="px-4 sm:px-6 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs font-condensed px-3 py-1.5 rounded-full border
                border-[#242424] text-[#6b7280] hover:border-[#f5c518]/40
                hover:text-[#f5c518] transition-all">
              <Sparkles size={11} className="inline mr-1" />{s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-[#1a1a1a] bg-[#0a0a0a] shrink-0">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            className="gym-input flex-1"
            placeholder="Ask NutriBot anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-yellow px-4 disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
