'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHeaderStore } from '@/stores/headerStore';
import SpriteAnimation from '@/components/about/SpriteAnimation';
import styles from './page.module.scss';

gsap.registerPlugin(ScrollTrigger);

const REVOLVING_WORDS = ['남친이랑', '친구랑', '직장상사와', '엄마랑'];
const REVOLVING_ORDER = [2, 3, 0, 1]; // 직장상사와 → 엄마랑 → 남친이랑 → 친구랑
const WORD_HEIGHT = 52;
const CYCLE_DURATION = 2;

const featureCards = [
  { num: 'feature 01', title: '갈등을 AI로\n판결받아보세요' },
  { num: 'feature 02', title: '갈등을 해결하고\n내 갈등유형을\n확인해보세요' },
  { num: 'feature 03', title: '감정일기로\n그날하루를 기록하세요' },
];

export default function AboutPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const [phase, setPhase] = useState<'animation' | 'iris-out' | 'content'>('animation');
  const containerRef = useRef<HTMLDivElement>(null);
  const revolvingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => setHeader(null);
  }, []);

  useEffect(() => {
    if (phase === 'content') {
      setHeader({ variant: 'title', title: '서비스 소개', onBack: () => router.back() });
    }
  }, [phase]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('iris-out'), 1700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'iris-out') return;
    const timer = setTimeout(() => setPhase('content'), 800);
    return () => clearTimeout(timer);
  }, [phase]);

  const setupAnimations = useCallback(() => {
    if (phase !== 'content' || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero phone entrance
      gsap.fromTo(`.${styles.heroPhone}`,
        { opacity: 0, y: 80, rotateZ: 0 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
      );

      // Hero text entrance
      gsap.fromTo(`.${styles.heroTextBlock}`,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power2.out' }
      );

      // Revolving words: vertical scroll loop
      if (revolvingRef.current) {
        const track = revolvingRef.current.querySelector(`.${styles.revolvingTrack}`) as HTMLElement;
        const allItems = revolvingRef.current.querySelectorAll(`.${styles.revolvingWord}`);
        if (track && allItems.length > 0) {
          const totalOriginal = REVOLVING_WORDS.length;
          const startIndex = REVOLVING_ORDER[0];
          gsap.set(track, { y: -(startIndex * WORD_HEIGHT) });

          // color init: highlight first active
          allItems.forEach((item, i) => {
            const wordIdx = i % totalOriginal;
            gsap.set(item, {
              color: wordIdx === startIndex ? '#1a1d1f' : '#c9cdd1',
              fontWeight: wordIdx === startIndex ? 700 : 400,
            });
          });

          const tl = gsap.timeline({ repeat: -1, delay: 1.2 });

          for (let step = 1; step <= REVOLVING_ORDER.length; step++) {
            const nextIdx = REVOLVING_ORDER[step % REVOLVING_ORDER.length];
            const targetSlot = step < REVOLVING_ORDER.length ? nextIdx : nextIdx + totalOriginal;

            tl.to(allItems, { color: '#c9cdd1', fontWeight: 400, duration: 0.25 }, step * CYCLE_DURATION);
            tl.to(track, { y: -(targetSlot * WORD_HEIGHT), duration: 0.5, ease: 'power2.inOut' }, step * CYCLE_DURATION);
            tl.call(() => {
              allItems.forEach((item, i) => {
                const wordIdx = i % totalOriginal;
                gsap.set(item, {
                  color: wordIdx === nextIdx ? '#1a1d1f' : '#c9cdd1',
                  fontWeight: wordIdx === nextIdx ? 700 : 400,
                });
              });
            }, [], step * CYCLE_DURATION + 0.3);

            // Reset position seamlessly when wrapping
            if (step === REVOLVING_ORDER.length) {
              tl.call(() => {
                gsap.set(track, { y: -(nextIdx * WORD_HEIGHT) });
              }, [], step * CYCLE_DURATION + 0.55);
            }
          }
        }
      }

      // Feature cards scroll trigger
      gsap.utils.toArray<HTMLElement>(`.${styles.featureCard}`).forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.6, delay: i * 0.15,
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });

      // Showcase sections scroll trigger
      gsap.utils.toArray<HTMLElement>(`.${styles.showcaseSection}`).forEach((section) => {
        const text = section.querySelector(`.${styles.showcaseText}`);
        const phone = section.querySelector(`.${styles.showcasePhoneWrap}`);
        const isReverse = section.classList.contains(styles.reverse);

        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
        });

        if (text) {
          tl.fromTo(text,
            { opacity: 0, x: isReverse ? 60 : -60 },
            { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }
          );
        }
        if (phone) {
          tl.fromTo(phone,
            { opacity: 0, x: isReverse ? -60 : 60 },
            { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' },
            '-=0.5'
          );
        }
      });

      // CTA scroll trigger
      const cta = document.querySelector(`.${styles.ctaSection}`);
      if (cta) {
        gsap.fromTo(cta.children, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.12,
          scrollTrigger: { trigger: cta, start: 'top 80%', toggleActions: 'play none none reverse' },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [phase]);

  useEffect(() => {
    return setupAnimations();
  }, [setupAnimations]);

  return (
    <div className={styles.page}>
      {/* Intro Animation */}
      {phase !== 'content' && (
        <div className={`${styles.introOverlay} ${phase === 'iris-out' ? styles['iris-out'] : ''}`}>
          <div className={styles.animationWrapper}>
            <SpriteAnimation
              src="/images/characters-actions/Judge Owl-striking_gavel_down.png"
              frameCount={25} columns={5} frameWidth={256} frameHeight={256} fps={12}
            />
          </div>
        </div>
      )}

      {phase === 'content' && (
        <div ref={containerRef} className={styles.content}>
          {/* ===== TAB 1: HERO ===== */}
          <section className={styles.heroSection}>
            <div className={styles.heroInner}>
              <div className={styles.heroRow}>
                <div ref={revolvingRef} className={styles.revolvingArea}>
                  <div className={styles.revolvingMask}>
                    <div className={styles.revolvingTrack}>
                      {[...REVOLVING_WORDS, ...REVOLVING_WORDS].map((word, i) => (
                        <span key={`${word}-${i}`} className={styles.revolvingWord}>{word}</span>
                      ))}
                    </div>
                  </div>
                  <span className={styles.fixedSuffix}>갈등상황</span>
                </div>
                <div className={styles.heroPhone}>
                  <Image src="/images/about/10.png" alt="말해부엉 앱 화면" width={300} height={500} className={styles.heroPhoneImage} />
                </div>
                <div className={styles.heroTextBlock}>
                  <h1 className={styles.heroTitle}>
                    <span className={styles.highlight}>말해부엉</span> 하나로 해결가능
                  </h1>
                </div>
              </div>
            </div>
          </section>

          {/* ===== TAB 2: FEATURE CARDS ===== */}
          <section className={styles.featureCardsSection}>
            <div className={styles.featureCardsInner}>
              {featureCards.map((card) => (
                <div key={card.num} className={styles.featureCard}>
                  <span className={styles.featureNum}>{card.num}</span>
                  <p className={styles.featureCardTitle}>{card.title}</p>
                  <div className={styles.featureCardIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== TAB 3: 상대 초대 ===== */}
          <section className={`${styles.showcaseSection} ${styles.bgWhite}`}>
            <div className={styles.showcaseText}>
              <h2 className={styles.showcaseTitle}>{'상대를 초대해\n둘만의 방을 만들어보세요'}</h2>
              <p className={styles.showcaseDesc}>
                혼자 판결도 가능하지만<br />
                상대를 초대해 판결받으면 더욱 객관적인 판결결과를 얻을수 있어요
              </p>
            </div>
            <div className={styles.showcasePhoneWrap}>
              <div className={styles.phoneMockupStraight}>
                <div className={styles.phoneScreenClipped}>
                  <Image src="/images/about/8.png" alt="상대 초대" width={260} height={560} className={styles.screenImage} />
                </div>
              </div>
            </div>
          </section>

          {/* ===== TAB 4: 감정일기 ===== */}
          <section className={`${styles.showcaseSection} ${styles.reverse} ${styles.bgLight}`}>
            <div className={styles.showcasePhoneWrap}>
              <div className={styles.phoneMockupTilted}>
                <div className={styles.phoneScreen}>
                  <Image src="/images/about/3.png" alt="감정일기" width={260} height={560} className={styles.screenImage} />
                </div>
              </div>
            </div>
            <div className={styles.showcaseText}>
              <h2 className={styles.showcaseTitle}>하루의 감정을 기록해 보세요</h2>
              <p className={styles.showcaseDesc}>
                오늘 감정을 기록하고 푸른하늘에 묻어버리세요!
              </p>
            </div>
          </section>

          {/* ===== TAB 5: 쌓인 기록 ===== */}
          <section className={`${styles.showcaseSection} ${styles.bgWhite}`}>
            <div className={styles.showcaseText}>
              <h2 className={styles.showcaseTitle}>{'쌓인 기록으로\n서로를 이해하는 시간을 가져보세요'}</h2>
              <p className={styles.showcaseDesc}>
                갈등 후 어떻게 사과해야할지 모르겠다면<br />
                말해부엉이 상대방에게 건네줄 사과 리본까지 만들어드려요
              </p>
            </div>
            <div className={styles.showcasePhoneWrap}>
              <div className={styles.phoneMockupStraight}>
                <div className={styles.phoneScreenClipped}>
                  <Image src="/images/about/6.png" alt="판결 결과" width={260} height={560} className={styles.screenImage} />
                </div>
              </div>
            </div>
          </section>

          {/* ===== TAB 6: CTA ===== */}
          <section className={styles.ctaSection}>
            <Image src="/images/characters/character-welcome.svg" alt="말해부엉" width={72} height={72} className={styles.ctaOwl} />
            <p className={styles.ctaMainText}>
              <span className={styles.highlight}>말해부엉</span>으로 어디서나 편하게 갈등해결할 수 있어요
            </p>
            <button className={styles.ctaButton} onClick={() => router.push('/login')}>
              말해부엉 바로가기
            </button>
            <footer className={styles.ctaFooter}>
              <span className={styles.footerLogo}>말해부엉</span>
              <div className={styles.footerLinks}>
                <span>서비스 소개</span>
                <span>개인정보 처리방침</span>
                <span>이용약관</span>
                <span>고객문의</span>
              </div>
              <span className={styles.footerCopy}>Copyright © 말해부엉. ALL Rights Reserved.</span>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
