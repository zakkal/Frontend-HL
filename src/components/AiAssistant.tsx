import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Bot, Sparkles, Plus, Trash2, History, ArrowLeft, AlertTriangle } from 'lucide-react'
import { api } from '../lib/api'

interface Message {
  sender: 'user' | 'ai'
  text: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
}

// ─── Quota Tracker (localStorage) ─────────────────────────────
// Reset jam 15:00 WIB = 08:00 UTC setiap hari
const QUOTA_KEY = 'hl_ai_quota'
const DAILY_LIMIT = 1000
const WARN_THRESHOLD = 50 // mulai warning saat sisa <= 50

function getResetTimeWIB(): Date {
  const now = new Date()
  // Reset jam 15:00 WIB (08:00 UTC)
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 0, 0, 0))
  // Jika sekarang sudah lewat jam 15:00 WIB hari ini, reset besok
  if (now.getTime() >= reset.getTime()) {
    reset.setUTCDate(reset.getUTCDate() + 1)
  }
  return reset
}

function formatResetTime(resetDate: Date): string {
  return resetDate.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' WIB'
}

export interface QuotaState {
  used: number
  date: string // YYYY-MM-DD in WIB
}

function getTodayWIB(): string {
  return new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })
}

export function getQuota(): QuotaState {
  try {
    const raw = localStorage.getItem(QUOTA_KEY)
    if (raw) {
      const parsed: QuotaState = JSON.parse(raw)
      if (parsed.date === getTodayWIB()) return parsed
    }
  } catch (_) {}
  return { used: 0, date: getTodayWIB() }
}

export function incrementQuota(): QuotaState {
  const current = getQuota()
  const updated: QuotaState = { ...current, used: current.used + 1 }
  localStorage.setItem(QUOTA_KEY, JSON.stringify(updated))
  return updated
}

export function getRemainingQuota(): number {
  return Math.max(0, DAILY_LIMIT - getQuota().used)
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'chat' | 'list'>('chat')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quotaRemaining, setQuotaRemaining] = useState(getRemainingQuota())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Load chats from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hl_ai_sessions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.length > 0) {
          setSessions(parsed)
          setActiveSessionId(parsed[0].id)
          return
        }
      } catch (e) {
        console.error('Failed to parse saved chats', e)
      }
    }
    
    // Default initial chat session
    const defaultSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Percakapan Baru',
      messages: [
        {
          sender: 'ai',
          text: 'Halo! Saya HL AI Assistant 🤖. Ada yang bisa saya bantu terkait laporan keuangan, piutang pelanggan, katalog produk, atau performa penjualan hari ini?'
        }
      ]
    }
    setSessions([defaultSession])
    setActiveSessionId(defaultSession.id)
    localStorage.setItem('hl_ai_sessions', JSON.stringify([defaultSession]))
  }, [])

  // Save chats utility
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated)
    localStorage.setItem('hl_ai_sessions', JSON.stringify(updated))
  }

  // Create new chat session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Percakapan Baru',
      messages: [
        {
          sender: 'ai',
          text: 'Halo! Saya HL AI Assistant 🤖. Ada yang bisa saya bantu terkait laporan keuangan, piutang pelanggan, katalog produk, atau performa penjualan hari ini?'
        }
      ]
    }
    const updated = [newSession, ...sessions]
    saveSessions(updated)
    setActiveSessionId(newSession.id)
    setView('chat')
  }

  // Delete chat session
  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = sessions.filter(s => s.id !== id)
    if (updated.length === 0) {
      const defaultSession: ChatSession = {
        id: Date.now().toString(),
        title: 'Percakapan Baru',
        messages: [
          {
            sender: 'ai',
            text: 'Halo! Saya HL AI Assistant 🤖. Ada yang bisa saya bantu terkait laporan keuangan, piutang pelanggan, katalog produk, atau performa penjualan hari ini?'
          }
        ]
      }
      saveSessions([defaultSession])
      setActiveSessionId(defaultSession.id)
    } else {
      saveSessions(updated)
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id)
      }
    }
  }

  // Find current active session
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const messages = activeSession ? activeSession.messages : []

  // Eyes tracking mouse move effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isOpen) return
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const buttonCenterX = rect.left + rect.width / 2
        const buttonCenterY = rect.top + rect.height / 2
        
        const dx = e.clientX - buttonCenterX
        const dy = e.clientY - buttonCenterY
        const angle = Math.atan2(dy, dx)
        const distance = Math.min(Math.hypot(dx, dy) / 15, 2.5)
        
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        
        setMousePos({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && view === 'chat') {
      scrollToBottom()
    }
  }, [messages, isOpen, view])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !activeSession) return

    const userText = input
    setInput('')

    // Auto update title based on first query if it was named default
    let newTitle = activeSession.title
    if (activeSession.messages.length === 1 && newTitle === 'Percakapan Baru') {
      newTitle = userText.length > 25 ? userText.slice(0, 25) + '...' : userText
    }

    const updatedMessages: Message[] = [...activeSession.messages, { sender: 'user', text: userText }]
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, title: newTitle, messages: updatedMessages }
      }
      return s
    })

    saveSessions(updatedSessions)
    setLoading(true)

    try {
      const response = await api.askAiChat(userText)
      const updated = incrementQuota()
      setQuotaRemaining(DAILY_LIMIT - updated.used)
      const afterAiSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...updatedMessages, { sender: 'ai', text: response.reply }] }
        }
        return s
      })
      saveSessions(afterAiSessions as ChatSession[])
    } catch (err: any) {
      let friendlyError = `Maaf, terjadi kesalahan: ${err.message || 'Gagal terhubung dengan server AI.'}`
      
      const errMsg = (err.message || '').toLowerCase()
      if (errMsg.includes('token') || errMsg.includes('expired') || errMsg.includes('unauthorized') || errMsg.includes('jwt') || errMsg.includes('sesi') || errMsg.includes('login')) {
        friendlyError = `Sesi kamu telah berakhir karena sudah terlalu lama tidak aktif.

Yang perlu kamu lakukan:
1. Klik tombol Keluar di menu sidebar.
2. Login kembali dengan email dan password kamu.
3. Buka kembali chat ini dan lanjutkan seperti biasa.`
      } else if (errMsg.includes('quota') || errMsg.includes('limit') || errMsg.includes('429') || errMsg.includes('sibuk') || errMsg.includes('habis')) {
        // Tandai quota habis di tracker lokal
        const exhausted: QuotaState = { used: DAILY_LIMIT, date: getTodayWIB() }
        localStorage.setItem(QUOTA_KEY, JSON.stringify(exhausted))
        setQuotaRemaining(0)
        const resetStr = formatResetTime(getResetTimeWIB())
        friendlyError = `Layanan AI sedang tidak tersedia karena batas penggunaan harian telah tercapai.

Quota akan otomatis pulih pada:
${resetStr}

Yang bisa kamu lakukan sekarang:
1. Coba lagi setelah waktu di atas.
2. Semua fitur lain tetap bisa digunakan seperti biasa.
3. Jika sudah melewati waktu tersebut dan masih error, klik "+ Baru" untuk memulai percakapan baru.`
      } else if (errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('fetch') || errMsg.includes('failed to connect') || errMsg.includes('network')) {
        friendlyError = `Layanan AI sedang tidak dapat dijangkau saat ini.

Yang bisa kamu lakukan:
1. Pastikan koneksi internet kamu berjalan dengan baik.
2. Tunggu beberapa saat lalu coba kirim ulang pesan kamu.
3. Jika masalah berlanjut lebih dari 10 menit, coba refresh halaman ini.`
      } else {
        friendlyError = `Layanan AI sedang mengalami gangguan sementara.

Yang bisa kamu lakukan:
1. Coba kirim ulang pesan kamu beberapa saat lagi.
2. Jika masih gagal, klik tombol "+ Baru" di atas untuk memulai percakapan baru.
3. Semua fitur lain seperti transaksi dan laporan tetap bisa digunakan seperti biasa.`
      }

      const afterErrorSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [
              ...updatedMessages,
              {
                sender: 'ai',
                text: friendlyError
              }
            ]
          }
        }
        return s
      })
      saveSessions(afterErrorSessions as ChatSession[])
    } finally {
      setLoading(false)
    }
  }

  // Formatting markdown lists and custom elements
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content: React.ReactNode = line

      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*')
      if (isBullet) {
        const rawContent = line.replace(/^[\s-*]+/, '')
        content = <li className="list-disc ml-4 mt-1">{parseBoldText(rawContent)}</li>
      } else {
        content = <p className="min-h-[1rem]">{parseBoldText(line)}</p>
      }

      return <div key={idx}>{content}</div>
    })
  }

  const parseBoldText = (str: string): React.ReactNode[] => {
    const cleanStr = str.replace(/\*/g, '')
    return [cleanStr]
  }

  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-50 bg-gray-900 border-2 border-amber-400 hover:border-amber-300 text-amber-400 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
      >
        {/* Hover tooltip */}
        <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
          isHovered && !isOpen
            ? 'opacity-100 translate-y-0 pointer-events-none'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          <div className="bg-gray-900 border border-amber-400/40 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl shadow-black/40 w-52">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping flex-shrink-0" />
              <p className="text-xs font-bold text-amber-400">HL AI Assistant</p>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Halo! Saya AI siap membantu kamu analisis keuangan, piutang, dan performa bisnis. 👋
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500">Klik untuk mulai chat</span>
              <span className="text-amber-400 text-[10px]">→</span>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-gray-900 border-r border-b border-amber-400/40 rotate-45" />
        </div>
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Antenna */}
            <rect x="17" y="2" width="2" height="4" fill="#FBBF24" rx="1" />
            <circle cx="18" cy="2" r="2" fill="#FBBF24" className="animate-pulse" />
            
            {/* Robot Head Outer */}
            <rect x="6" y="6" width="24" height="22" rx="6" fill="#111827" stroke="#FBBF24" strokeWidth="2" />
            
            {/* Ears */}
            <rect x="3" y="13" width="3" height="8" rx="1.5" fill="#FBBF24" />
            <rect x="30" y="13" width="3" height="8" rx="1.5" fill="#FBBF24" />
            
            {/* Eye Screen visor */}
            <rect x="9" y="10" width="18" height="10" rx="3" fill="#030712" />
            
            {/* Left Eye Socket & Pupil */}
            <g transform="translate(13, 15)">
              <circle cx="0" cy="0" r="3.5" fill="#1F2937" />
              <circle cx={mousePos.x} cy={mousePos.y} r="1.8" fill="#FBBF24" style={{ transition: 'transform 0.05s ease-out' }} />
            </g>
            
            {/* Right Eye Socket & Pupil */}
            <g transform="translate(23, 15)">
              <circle cx="0" cy="0" r="3.5" fill="#1F2937" />
              <circle cx={mousePos.x} cy={mousePos.y} r="1.8" fill="#FBBF24" style={{ transition: 'transform 0.05s ease-out' }} />
            </g>
            
            {/* Mouth */}
            <path d="M14 23 H22" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-gray-900 border border-gray-800 rounded-2xl w-80 sm:w-96 h-[500px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              {view === 'list' ? (
                <button 
                  onClick={() => setView('chat')}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer mr-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setView('list')}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer mr-1 relative group"
                  title="Riwayat Percakapan"
                >
                  <History className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-bold px-1 rounded-full">{sessions.length}</span>
                </button>
              )}
              
              <div className="flex items-center gap-1.5">
                <div className="bg-amber-400/10 p-1.5 rounded-lg">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {view === 'list' ? 'Riwayat Chat' : 'HL AI Assistant'}
                  </h3>
                  {view === 'chat' && (
                    <p className="text-xs text-green-400 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                      HL Agen Online
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {view === 'chat' && (
                <button
                  onClick={handleNewChat}
                  className="bg-amber-400 hover:bg-amber-500 text-black p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  title="Percakapan Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Baru
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quota Warning Bar */}
          {quotaRemaining <= WARN_THRESHOLD && quotaRemaining > 0 && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <p className="text-xs text-yellow-300">
                Sisa <span className="font-bold">{quotaRemaining}</span> request AI hari ini. Reset: {formatResetTime(getResetTimeWIB())}
              </p>
            </div>
          )}
          {quotaRemaining === 0 && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300">
                Limit harian habis. Tersedia kembali: {formatResetTime(getResetTimeWIB())}
              </p>
            </div>
          )}

          {/* Body Section */}
          {view === 'list' ? (
            /* CONVERSATION HISTORY LIST VIEW */
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-950/40">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Daftar Percakapan</span>
                <button
                  onClick={handleNewChat}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Chat Baru
                </button>
              </div>

              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id)
                    setView('chat')
                  }}
                  className={`group p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    s.id === activeSessionId
                      ? 'bg-amber-400/10 border-amber-400/50 text-amber-400'
                      : 'bg-gray-850 border-gray-800/80 hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                    <span className="text-sm font-medium truncate pr-2">{s.title}</span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteChat(e, s.id)}
                    className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                    title="Hapus Percakapan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* ACTIVE CHAT MESSAGES VIEW */
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/40">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 max-w-[85%] ${
                      msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="bg-gray-800 text-amber-400 p-1.5 rounded-lg h-fit flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-gray-200 ${
                        msg.sender === 'user'
                          ? 'bg-amber-400 text-black font-medium rounded-tr-none'
                          : 'bg-gray-850 border border-gray-800 rounded-tl-none'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="bg-gray-800 text-amber-400 p-1.5 rounded-lg h-fit">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-850 border border-gray-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Tanyakan keuangan, piutang, produk..."
                  disabled={loading}
                  className="flex-1 bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-amber-400 hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-600 text-black p-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
