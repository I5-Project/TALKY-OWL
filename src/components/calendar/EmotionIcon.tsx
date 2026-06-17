import Image from 'next/image';

type Feel = '기쁨' | '슬픔' | '보통' | '짜증' | '화남';

type Props = {
  feel: string;
  size?: number;
};

const EMOTION_ICON_MAP: Record<Feel, string> = {
  기쁨: '/images/icons/emotions/emotion-happy.svg',
  슬픔: '/images/icons/emotions/emotion-sad.svg',
  보통: '/images/icons/emotions/emotion-neutral.svg',
  짜증: '/images/icons/emotions/emotion-annoyed.svg',
  화남: '/images/icons/emotions/emotion-angry.svg',
};

export default function EmotionIcon({ feel, size = 20 }: Props) {
  const src = EMOTION_ICON_MAP[feel as Feel];
  if (!src) return null;
  return <Image src={src} width={size} height={size} alt={feel} />;
}
