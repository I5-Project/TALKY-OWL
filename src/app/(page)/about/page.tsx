'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import BalanceIcon from '@mui/icons-material/Balance';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useHeaderStore } from '@/stores/headerStore';
import SpriteAnimation from '@/components/about/SpriteAnimation';
import styles from './page.module.scss';
import HomeServiceInfo from '@/components/home/HomeServiceInfo';

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

// 아래에서 페이드
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

// 왼쪽 슬라이드
const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
};

// 오른쪽 슬라이드
const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
};

// 대각선 걸어오는 느낌 (animals01)
const walkIn: Variants = {
  hidden: { opacity: 0, x: -60, y: 40 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 1.1, ease: EASE } },
};

// 위에서 스프링 바운스 (animals02)
const dropBounce: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 14, delay: 0.2 },
  },
};

// 스케일 + 페이드 (feature cards)
const cardContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

// 스케일업 (showcase 폰 이미지)
const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.95, ease: EASE } },
};

// 아래서 크게 올라옴 (showcase 3 폰)
const riseUp: Variants = {
  hidden: { opacity: 0, y: 70 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: EASE } },
};

const REVOLVING_WORDS = ['남친', '친구', '상사', '엄마'];
const REVOLVING_ORDER = [2, 3, 0, 1];
const CYCLE_DURATION = 2000;

const featureCards = [
  {
    num: 'feature 01',
    title: '갈등을 AI로\n판결받아보세요',
    icon: <BalanceIcon sx={{ fontSize: 48, color: 'inherit' }} />,
  },
  {
    num: 'feature 02',
    title: '갈등을 해결하고\n내 갈등유형을\n확인해보세요',
    icon: <LibraryAddCheckIcon sx={{ fontSize: 48, color: 'inherit' }} />,
  },
  {
    num: 'feature 03',
    title: '감정일기로\n그날하루를 기록하세요',
    icon: <CalendarMonthIcon sx={{ fontSize: 48, color: 'inherit' }} />,
  },
];

export default function AboutPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const [phase, setPhase] = useState<'animation' | 'iris-out' | 'content'>('animation');
  const [orderIdx, setOrderIdx] = useState(0);
  const [phonePhase, setPhonePhase] = useState<'enter' | 'float'>('enter');

  useEffect(() => {
    return () => setHeader(null);
  }, []);

  useEffect(() => {
    if (phase === 'content') setHeader(null);
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
    let interval: ReturnType<typeof setInterval>;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setOrderIdx((prev) => (prev + 1) % REVOLVING_ORDER.length);
      }, CYCLE_DURATION);
    }, 1500);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [phase]);

  const total = REVOLVING_WORDS.length;
  const activeIdx = REVOLVING_ORDER[orderIdx];
  const aboveWords = [
    REVOLVING_WORDS[(activeIdx - 2 + total) % total],
    REVOLVING_WORDS[(activeIdx - 1 + total) % total],
  ];
  const belowWord = REVOLVING_WORDS[(activeIdx + 1) % total];

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
        <div className={styles.content}>
          {/* ===== HEADER ===== */}
          <header className={styles.aboutHeader}>
            <div className={styles.aboutHeaderInner}>
              <Image
                src="/images/common/logo.svg"
                alt="말해부엉"
                width={120}
                height={32}
                className={styles.headerLogo}
              />
              <button className={styles.headerLink} onClick={() => router.push('/')}>
                서비스 바로가기
              </button>
            </div>
          </header>

          {/* ===== HERO ===== */}
          <section className={styles.heroSection}>
            <div className={styles.heroInner}>
              <Image
                src="/images/about/s1_bg.svg"
                alt=""
                width={900}
                height={900}
                className={styles.heroBg}
              />
              <div className={styles.heroCenter}>
                <motion.div
                  initial={{ y: 80 }}
                  animate={phonePhase === 'enter' ? { y: 0 } : { y: [0, -16, 0] }}
                  transition={
                    phonePhase === 'enter'
                      ? { duration: 1, delay: 0.2, ease: 'easeOut' }
                      : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  }
                  onAnimationComplete={() => {
                    if (phonePhase === 'enter') setPhonePhase('float');
                  }}
                >
                  <Image
                    src="/images/about/mockup01.png"
                    alt="말해부엉 앱 화면"
                    width={764}
                    height={764}
                    className={styles.heroPhoneImage}
                  />
                </motion.div>
              </div>

              <div className={styles.heroLeft}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={orderIdx}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className={styles.revolvingMask}>
                      {aboveWords.map((word, i) => (
                        <span key={i} className={styles.revolvingWord}>
                          {word}
                        </span>
                      ))}
                    </div>
                    <div className={styles.activeRow}>
                      <span className={styles.activeWord}>{REVOLVING_WORDS[activeIdx]}</span>
                      <span className={styles.fixedSuffix}>와의 갈등상황</span>
                    </div>
                    <div className={styles.revolvingBelow}>
                      <span className={styles.revolvingWord}>{belowWord}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={styles.heroRight}>
                <h1 className={styles.heroTitle}>
                  <Image src="/images/common/logo.svg" alt="말해부엉" width={200} height={50} />
                  하나로 해결가능
                </h1>
              </div>
            </div>
          </section>

          {/* ===== FEATURE CARDS ===== */}
          <section className={styles.featureCardsSection}>
            <motion.div
              variants={walkIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className={styles.animalCatnDog}
            >
              <Image
                src="/images/about/animals01.png"
                alt="고양이와강아지"
                width={700}
                height={422}
              />
            </motion.div>
            <div className={styles.featureCardsOuter}>
              <motion.div
                variants={dropBounce}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className={styles.animalPanda}
              >
                <Image
                  src="/images/about/animals02.png"
                  alt="판다"
                  width={120}
                  height={120}
                />
              </motion.div>
              <motion.div
                className={styles.featureCardsInner}
                variants={cardContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {featureCards.map((card) => (
                  <motion.div
                    key={card.num}
                    className={styles.featureCard}
                    variants={cardItem}
                    whileHover={{ y: -6, transition: { duration: 0.2, ease: EASE } }}
                  >
                    <div className={styles.featureCardText}>
                      <span className={styles.featureNum}>{card.num}</span>
                      <p className={styles.featureCardTitle}>{card.title}</p>
                    </div>
                    <div className={styles.featureCardIcon}>{card.icon}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== 상대 초대 ===== */}
          <div className={`${styles.showcaseWrapper} ${styles.bgWhite}`}>
            <div className={styles.showcaseSection}>
              <motion.div
                className={styles.showcaseText}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h2 className={styles.showcaseTitle}>
                  {'상대를 초대해\n둘만의 방을 만들어보세요'}
                </h2>
                <p className={styles.showcaseDesc}>
                  혼자 판결도 가능하지만
                  <br />
                  상대를 초대해 판결받으면 더욱 객관적인 판결결과를 얻을수 있어요
                </p>
              </motion.div>
              <motion.div
                className={styles.showcasePhoneWrap}
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Image
                  src="/images/about/mockup02.png"
                  alt="상대 초대"
                  width={501}
                  height={672}
                  className={styles.showcasePhoneImage}
                />
              </motion.div>
            </div>
          </div>

          {/* ===== 감정일기 ===== */}
          <div className={`${styles.showcaseWrapper} ${styles.bgLight}`}>
            <div className={styles.showcaseSection}>
              <motion.div
                className={styles.showcasePhoneWrap}
                variants={slideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Image
                  src="/images/about/mockup03.png"
                  alt="감정일기"
                  width={629}
                  height={775}
                  className={styles.showcasePhoneImage}
                />
              </motion.div>
              <motion.div
                className={`${styles.showcaseText} ${styles.showcaseTextRight}`}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h2 className={styles.showcaseTitle}>하루의 감정을 기록해 보세요</h2>
                <p className={styles.showcaseDesc}>
                  말 못한 감정도 괜찮아요
                  <br />
                  일기로 꺼내놓으면 한결 가벼워질 거예요
                </p>
              </motion.div>
            </div>
          </div>

          {/* ===== 쌓인 기록 ===== */}
          <div className={`${styles.showcaseWrapper} ${styles.bgWhite}`}>
            <div className={styles.showcaseSection}>
              <motion.div
                className={styles.showcaseText}
                variants={slideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h2 className={styles.showcaseTitle}>
                  {'쌓인 기록으로\n서로를 이해하는 시간을 가져보세요'}
                </h2>
                <p className={styles.showcaseDesc}>
                  갈등 후 어떻게 사과해야할지 모르겠다면
                  <br />
                  말해부엉이 상대방에게 건네줄 사과 대본까지 만들어드려요
                </p>
              </motion.div>
              <motion.div
                className={styles.showcasePhoneWrap}
                variants={riseUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Image
                  src="/images/about/mockup04.png"
                  alt="판결 결과"
                  width={517}
                  height={715}
                  className={styles.showcasePhoneImageTop}
                />
              </motion.div>
            </div>
          </div>

          {/* ===== CTA ===== */}
          <motion.section
            className={styles.ctaSection}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <Image
              src="/images/characters/character-welcome.svg"
              alt="말해부엉"
              width={120}
              height={120}
              className={styles.ctaOwl}
            />
            <p className={styles.ctaMainText}>
              <span className={styles.highlight}>말해부엉</span>으로 어디서나 편하게 갈등해결할 수
              있어요
            </p>
            <button className={styles.ctaButton} onClick={() => router.push('/login')}>
              말해부엉 바로가기
            </button>
          </motion.section>

          {/* ===== FOOTER ===== */}
          <div className={styles.serviceInfoWrapper}>
            <HomeServiceInfo />
          </div>
        </div>
      )}
    </div>
  );
}
