'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHeaderStore } from '@/stores/headerStore';
import SpriteAnimation from '@/components/about/SpriteAnimation';
import styles from './page.module.scss';

gsap.registerPlugin(ScrollTrigger);

const floatingTags = [
  { text: '나였이면', className: 'tagTopLeft' },
  { text: '친구랑', className: 'tagTopRight' },
  { text: '직장상사의 갈등상황', className: 'tagMiddleLeft' },
  { text: '엄마랑', className: 'tagBottomLeft' },
];

const featureCards = [
  {
    num: 'Feature 01',
    icon: '/images/characters/character-case.svg',
    title: '갈등을 AI로\n판결해보세요',
  },
  {
    num: 'Feature 02',
    icon: '/images/characters/character-home.svg',
    title: '갈등을 빠르고\n내 갈등유형을\n확인해보세요',
  },
  {
    num: 'Feature 03',
    icon: '/images/characters/character-gift.svg',
    title: '감정일기고\n그날부엉 기록하세요',
  },
];

const showcaseSections = [
  {
    id: 'invite',
    image: '/images/about/5.png',
    title: '상대를 초대해\n둘만의 방을 만들어보세요',
    description: '갈등 갈등, 가치관? 연애?\n상대를 초대해 두근거리는 단 하나의 사건으로 판결을 만들어요.',
    dark: false,
    reverse: false,
  },
  {
    id: 'diary',
    image: '/images/about/3.png',
    title: '하루의 감정을 기록해 보세요',
    description: '',
    dark: true,
    reverse: true,
    badge: '배근형',
  },
  {
    id: 'records',
    image: '/images/about/2.png',
    title: '쌓인 기록으로\n서로를 이해하는 시간을 가져보세요',
    description: '많은 거 하지 않아도 돼요.\n말해부엉이 그 사건에 너 또는 내 사건에서 서로를 이해할 수 있게 말해요.',
    dark: false,
    reverse: false,
  },
];

export default function AboutPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const [phase, setPhase] = useState<'animation' | 'iris-out' | 'content'>('animation');
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (phase !== 'content') return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(`.${styles.floatingTag}`).forEach((tag, i) => {
        gsap.fromTo(tag,
          { opacity: 0, y: 30, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.3 + i * 0.15, ease: 'back.out(1.4)' }
        );
      });

      gsap.fromTo(`.${styles.heroPhone}`,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
      );

      gsap.fromTo(`.${styles.heroTextBlock}`,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.5, ease: 'power2.out' }
      );

      gsap.utils.toArray<HTMLElement>(`.${styles.featureCard}`).forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.5, delay: i * 0.15,
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(`.${styles.showcaseSection}`).forEach((section) => {
        const text = section.querySelector(`.${styles.showcaseText}`);
        const phone = section.querySelector(`.${styles.showcasePhone}`);
        const isReverse = section.classList.contains(styles.reverse);

        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' },
        });

        if (text) {
          tl.fromTo(text,
            { opacity: 0, x: isReverse ? 40 : -40 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
          );
        }
        if (phone) {
          tl.fromTo(phone,
            { opacity: 0, x: isReverse ? -40 : 40 },
            { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' },
            '-=0.4'
          );
        }
      });

      const cta = document.querySelector(`.${styles.ctaSection}`);
      if (cta) {
        gsap.fromTo(cta.children, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.15,
          scrollTrigger: { trigger: cta, start: 'top 80%', toggleActions: 'play none none reverse' },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [phase]);

  return (
    <div className={styles.page}>
      {phase !== 'content' && (
        <div className={`${styles.introOverlay} ${phase === 'iris-out' ? styles['iris-out'] : ''}`}>
          <div className={styles.animationWrapper}>
            <SpriteAnimation
              src="/images/characters-actions/Judge Owl-striking_gavel_down.png"
              frameCount={25}
              columns={5}
              frameWidth={256}
              frameHeight={256}
              fps={12}
            />
          </div>
        </div>
      )}

      {phase === 'content' && (
        <div ref={containerRef} className={styles.content}>
          <section className={styles.heroSection}>
            <div className={styles.heroInner}>
              <div className={styles.heroPhoneArea}>
                {floatingTags.map((tag) => (
                  <span key={tag.className} className={`${styles.floatingTag} ${styles[tag.className]}`}>
                    {tag.text}
                  </span>
                ))}
                <div className={styles.heroPhone}>
                  <div className={styles.phoneFrame}>
                    <Image src="/images/about/1.png" alt="말해부엉 홈 화면" width={220} height={440} className={styles.phoneImage} />
                  </div>
                </div>
              </div>
              <div className={styles.heroTextBlock}>
                <h1 className={styles.heroTitle}>
                  <span className={styles.highlight}>말해부엉</span> 하나로 해결가능
                </h1>
              </div>
            </div>
          </section>

          <section className={styles.featureCardsSection}>
            {featureCards.map((card) => (
              <div key={card.num} className={styles.featureCard}>
                <span className={styles.featureNum}>{card.num}</span>
                <div className={styles.featureIconWrap}>
                  <Image src={card.icon} alt={card.num} width={48} height={48} />
                </div>
                <p className={styles.featureCardTitle}>{card.title}</p>
              </div>
            ))}
          </section>

          {showcaseSections.map((section) => (
            <section
              key={section.id}
              className={`${styles.showcaseSection} ${section.dark ? styles.dark : ''} ${section.reverse ? styles.reverse : ''}`}
            >
              <div className={styles.showcaseText}>
                <h2 className={styles.showcaseTitle}>{section.title}</h2>
                {section.description && (
                  <p className={styles.showcaseDesc}>{section.description}</p>
                )}
              </div>
              <div className={styles.showcasePhone}>
                {section.badge && (
                  <span className={styles.showcaseBadge}>{section.badge}</span>
                )}
                <div className={styles.phoneFrame}>
                  <Image src={section.image} alt={section.id} width={260} height={520} className={styles.phoneImage} />
                </div>
              </div>
            </section>
          ))}

          <section className={styles.ctaSection}>
            <Image src="/images/characters/character-welcome.svg" alt="말해부엉" width={56} height={56} className={styles.ctaIcon} />
            <p className={styles.ctaDesc}>말해부엉으로 어디서나 편하게 갈등해결할 수 있다요</p>
            <button className={styles.ctaButton} onClick={() => router.push('/login')}>
              시작하기
            </button>
            <span className={styles.ctaFooter}>말해부엉 AI 갈등 조정 판결 서비스</span>
          </section>
        </div>
      )}
    </div>
  );
}
