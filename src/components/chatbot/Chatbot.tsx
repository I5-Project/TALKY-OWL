'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { useUserMe } from '@/domains/user/hooks'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import GavelRoundedIcon from '@mui/icons-material/GavelRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import ShareRoundedIcon from '@mui/icons-material/ShareRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import styles from './Chatbot.module.scss'

interface Message {
  role: 'user' | 'bot'
  content: string
  timestamp: string
}

const QUICK_REPLIES = [
  '서비스 이용방법',
  '자주묻는 질문',
  '판결 절차',
]

const MENU_ITEMS = [
  { icon: HelpOutlineRoundedIcon, label: '이용방법', message: '서비스는 어떻게 이용하나요?' },
  { icon: GavelRoundedIcon, label: '판결 절차', message: '판결은 어떻게 진행되나요?' },
  { icon: PersonOutlineRoundedIcon, label: '계정/로그인', message: '계정 관련 도움이 필요합니다' },
  { icon: MenuBookRoundedIcon, label: '감정일기', message: '감정일기는 어떻게 쓰나요?' },
  { icon: ShareRoundedIcon, label: '결과 공유', message: '판결 결과를 공유할 수 있나요?' },
  { icon: RestartAltRoundedIcon, label: '처음으로', message: '처음으로' },
]

const WELCOME_MESSAGE: Message = {
  role: 'bot',
  content: '안녕하세요! 토키올 고객문의 챗봇입니다.\n궁금한 점이 있으시면 편하게 질문해주세요!',
  timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const { data: user } = useUserMe()
  const displayName = user?.name ?? user?.nickname ?? '사용자'

  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLButtonElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const floatingTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null)
  const blinkTweenRef = useRef<gsap.core.Timeline | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<HTMLDivElement>(null)
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const quickRepliesRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(messages.length)
  const lastMessageElRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const animateOpen = useCallback(() => {
    const tl = gsap.timeline()

    tl.to(floatingRef.current, {
      scale: 0,
      rotation: 90,
      duration: 0.3,
      ease: 'power2.in',
    })
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' },
      '-=0.1'
    )
    tl.fromTo(
      containerRef.current,
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' },
      '-=0.2'
    )

    if (quickRepliesRef.current) {
      const buttons = quickRepliesRef.current.children
      tl.fromTo(
        buttons,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out' },
        '-=0.1'
      )
    }
  }, [])

  const animateClose = useCallback((onComplete: () => void) => {
    const tl = gsap.timeline({ onComplete })

    tl.to(containerRef.current, {
      y: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    })
    tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.15')
    tl.to(
      floatingRef.current,
      { scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(1.7)' },
      '-=0.1'
    )
  }, [])

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && lastMessageElRef.current) {
      const el = lastMessageElRef.current
      const isUser = messages[messages.length - 1].role === 'user'
      gsap.fromTo(
        el,
        { x: isUser ? 20 : -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
    prevMessageCountRef.current = messages.length
  }, [messages])

  useEffect(() => {
    if (!isLoading || !typingRef.current) return

    const dots = dotRefs.current.filter(Boolean)
    const tween = gsap.to(dots, {
      y: -5,
      repeat: -1,
      yoyo: true,
      duration: 0.4,
      stagger: 0.15,
      ease: 'power1.inOut',
    })

    return () => { tween.kill() }
  }, [isLoading])


  const handleFloatingEnter = useCallback(() => {
    if (!eyesRef.current || !floatingRef.current) return

    gsap.to(eyesRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: 'back.out(1.7)',
    })

    const tl = gsap.timeline({ repeat: -1 })
    tl.to(floatingRef.current, {
      y: -8,
      scaleY: 0.92,
      scaleX: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
    tl.to(floatingRef.current, {
      y: 0,
      scaleY: 1.08,
      scaleX: 0.95,
      duration: 0.25,
      ease: 'power2.in',
    })
    tl.to(floatingRef.current, {
      y: 0,
      scaleY: 1,
      scaleX: 1,
      duration: 0.35,
      ease: 'elastic.out(1, 0.4)',
    })
    floatingTweenRef.current = tl

    blinkTweenRef.current = gsap.timeline({ repeat: -1, repeatDelay: 2.5 })
    blinkTweenRef.current
      .to(eyesRef.current, { scaleY: 0.1, duration: 0.08, ease: 'power2.in' })
      .to(eyesRef.current, { scaleY: 1, duration: 0.08, ease: 'power2.out' })
  }, [])

  const handleFloatingLeave = useCallback(() => {
    if (!eyesRef.current) return

    gsap.to(eyesRef.current, {
      opacity: 0,
      scale: 0,
      duration: 0.15,
      ease: 'power2.in',
    })

    floatingTweenRef.current?.kill()
    blinkTweenRef.current?.kill()

    if (floatingRef.current) {
      gsap.to(floatingRef.current, { y: 0, duration: 0.3, ease: 'power2.out' })
    }
  }, [])

  const loadHistory = useCallback(async () => {
    if (historyLoaded) return
    try {
      const res = await fetch('/api/chatbot')
      if (!res.ok) return
      const data = await res.json()
      if (data.success && data.data.messages.length > 0) {
        setMessages([WELCOME_MESSAGE, ...data.data.messages])
      }
      setHistoryLoaded(true)
    } catch {
      // 히스토리 로드 실패 시 웰컴 메시지만 유지, 다음 열기 시 재시도
    }
  }, [historyLoaded])

  const handleOpen = () => {
    setIsOpen(true)
    loadHistory()
    requestAnimationFrame(() => animateOpen())
  }

  const handleClose = () => {
    animateClose(() => setIsOpen(false))
  }

  const getNow = () =>
    new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    if (text.trim() === '처음으로') {
      try {
        const res = await fetch('/api/chatbot', { method: 'DELETE' })
        if (!res.ok) throw new Error()
        setMessages([WELCOME_MESSAGE])
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: '대화 초기화에 실패했습니다. 잠시 후 다시 시도해주세요.', timestamp: getNow() },
        ])
      }
      return
    }

    const userMessage: Message = { role: 'user', content: text.trim(), timestamp: getNow() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })

      const data = await res.json()

      const botMessage: Message = {
        role: 'bot',
        content: data.success
          ? data.data.reply
          : '죄송합니다. 답변 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: getNow(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', timestamp: getNow() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      <button
        ref={floatingRef}
        className={styles.floatingButton}
        onClick={handleOpen}
        onMouseEnter={handleFloatingEnter}
        onMouseLeave={handleFloatingLeave}
        aria-label="고객문의 챗봇 열기"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" />
          <g ref={eyesRef} style={{ opacity: 0, transformOrigin: 'center center' }}>
            <rect x="8.5" y="8" width="2" height="4" rx="1" fill="currentColor" />
            <rect x="13.5" y="8" width="2" height="4" rx="1" fill="currentColor" />
          </g>
        </svg>
      </button>

      {isOpen && (
        <>
          <div ref={overlayRef} className={styles.overlay} onClick={handleClose} />
          <div ref={containerRef} className={styles.container}>
            <div className={styles.header}>
              <div className={styles.header__spacer} />
              <div className={styles.header__info}>
                <span className={styles.header__name}>{displayName}</span>
                <div className={styles.header__status}>
                  <span className={styles.header__lantern} />
                  <span className={styles.header__statusText}>봇과 대화중</span>
                </div>
              </div>
              <button className={styles.header__close} onClick={handleClose} aria-label="닫기">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.message} ${msg.role === 'user' ? styles['message--user'] : styles['message--bot']}`}
                  ref={i === messages.length - 1 ? (el) => { lastMessageElRef.current = el } : undefined}
                >
                  {msg.role === 'bot' ? (
                    <>
                      <span className={styles.message__sender}>토키올</span>
                      <div className={styles.botRow}>
                        <div className={styles.botAvatar}>AI</div>
                        <div className={styles.botContent}>
                          <div className={`${styles.bubble} ${styles['bubble--bot']}`}>
                            {msg.content}
                          </div>
                          <span className={styles.timestamp}>{msg.timestamp}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`${styles.bubble} ${styles['bubble--user']}`}>
                        {msg.content}
                      </div>
                      <span className={styles.timestamp}>{msg.timestamp}</span>
                    </>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className={styles.typing} ref={typingRef}>
                  <div className={styles.botAvatar}>AI</div>
                  <div className={styles.typingDots}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={styles.typingDot}
                        ref={(el) => { dotRefs.current[i] = el }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div ref={quickRepliesRef} className={styles.quickReplies}>
              {QUICK_REPLIES.map((text) => (
                <button
                  key={text}
                  className={styles.quickReply}
                  onClick={() => sendMessage(text)}
                  disabled={isLoading}
                >
                  {text}
                </button>
              ))}
            </div>

            <div className={styles.customMenu}>
              <div className={styles.customMenu__box}>
                <div className={styles.customMenu__grid}>
                  {MENU_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      data-menu-item
                      className={styles.customMenu__item}
                      onClick={() => sendMessage(item.message)}
                      disabled={isLoading}
                    >
                      <item.icon className={styles.customMenu__icon} />
                      <span className={styles.customMenu__label}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form className={styles.bottomBar} onSubmit={handleSubmit}>
              <input
                className={styles.bottomBar__input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요"
                maxLength={500}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={styles.bottomBar__send}
                disabled={!input.trim() || isLoading}
                aria-label="전송"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}
