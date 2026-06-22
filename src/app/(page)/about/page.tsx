'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useHeaderStore } from '@/stores/headerStore';
import SpriteAnimation from '@/components/about/SpriteAnimation';
import styles from './page.module.scss';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const sections = [
  {
    id: 'home',
    image: '/images/about/1.png',
    badge: '홈 화면',
    title: '오늘의 감정을\n한눈에 확인하세요',
    description: '감정일기 작성, 고민 카테고리 통계,\n진행중인 사건까지 한 화면에서 관리해요.',
  },
  {
    id: 'write',
    image: '/images/about/3.png',
    badge: '사건 작성',
    title: '갈등 상황을\n자유롭게 작성하세요',
    description: '연애, 가족, 친구, 직장 카테고리를 선택하고\n나의 진술서를 작성해요.',
  },
  {
    id: 'records',
    image: '/images/about/2.png',
    badge: '사건 기록',
    title: '모든 사건을\n카테고리별로 관리하세요',
    description: '등록한 사건들을 한눈에 확인하고\n카테고리별로 필터링할 수 있어요.',
  },
  {
    id: 'detail',
    image: '/images/about/5.png',
    badge: '사건 조회',
    title: '상대방을 초대해\n더 정확한 판결을 받으세요',
    description: '상대방의 진술까지 함께 제출하면\nAI가 더 공정한 판결을 내려줘요.',
  },
  {
    id: 'result',
    image: '/images/about/6.png',
    badge: 'AI 판결',
    title: 'AI가 분석한\n나의 갈등 유형은?',
    description: '16가지 유형 분석과 화해 제안까지,\n관계 회복을 위한 맞춤 판결을 받아보세요.',
  },
];

export default function AboutPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const [phase, setPhase] = useState<'animation' | 'iris-out' | 'content'>('animation');
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    return () => setHeader(null);
  }, []);

  useEffect(() => {
    if (phase === 'content') {
      setHeader({ variant: 'title', title: '서비스 소개', onBack: () => router.back() });
    }
  }, [phase]);

  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setPhase('iris-out');
    }, 1700);
    return () => clearTimeout(animationTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'iris-out') return;
    const contentTimer = setTimeout(() => {
      setPhase('content');
    }, 800);
    return () => clearTimeout(contentTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'content') return;

    const ctx = gsap.context(() => {
      sectionRefs.current.forEach((section) => {
        if (!section) return;

        const badge = section.querySelector(`.${styles.badge}`);
        const title = section.querySelector(`.${styles.title}`);
        const desc = section.querySelector(`.${styles.description}`);
        const phone = section.querySelector(`.${styles.phoneFrame}`);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none reverse',
          },
        });

        if (badge) tl.fromTo(badge, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
        if (title) tl.fromTo(title, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
        if (desc) tl.fromTo(desc, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
        if (phone) tl.fromTo(phone, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, '-=0.3');
      });

      const cta = document.querySelector(`.${styles.ctaSection}`);
      if (cta) {
        gsap.fromTo(
          cta.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.2,
            scrollTrigger: {
              trigger: cta,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
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
              <Image
                src="/images/characters/character-welcome.svg"
                alt="말해부엉 캐릭터"
                width={120}
                height={120}
                className={styles.heroCharacter}
              />
              <h1 className={styles.heroTitle}>말해부엉</h1>
              <p className={styles.heroSubtitle}>AI가 판결하는 갈등 조정 서비스</p>
              <p className={styles.heroDesc}>
                갈등, 혼자 끙끙 앓지 마세요.<br />
                말해부엉이 공정하게 판결해드릴게요.
              </p>
            </div>
          </section>

          {sections.map((section, index) => (
            <section
              key={section.id}
              ref={(el) => { sectionRefs.current[index] = el; }}
              className={`${styles.featureSection} ${index % 2 === 1 ? styles.reversed : ''}`}
            >
              <div className={styles.featureText}>
                <span className={styles.badge}>{section.badge}</span>
                <h2 className={styles.title}>{section.title}</h2>
                <p className={styles.description}>{section.description}</p>
              </div>
              <div className={styles.phoneFrame}>
                <Image
                  src={section.image}
                  alt={section.badge}
                  width={280}
                  height={560}
                  className={styles.phoneImage}
                />
              </div>
            </section>
          ))}

          <section className={styles.ctaSection}>
            <Image
              src="/images/characters/character-gift.svg"
              alt="말해부엉 선물"
              width={64}
              height={64}
              className={styles.ctaIcon}
            />
            <h2 className={styles.ctaTitle}>지금 바로 시작해보세요</h2>
            <p className={styles.ctaDesc}>말해부엉과 함께 갈등을 해결하고<br />관계를 회복해보세요.</p>
            <button
              className={styles.ctaButton}
              onClick={() => router.push('/login')}
            >
              시작하기
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
