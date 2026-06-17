import React from 'react';

type Feel = '기쁨' | '슬픔' | '보통' | '짜증' | '화남';

type Props = {
  feel: string;
  size?: number;
};

const icons: Record<Feel, React.ReactElement> = {
  기쁨: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#FFD93D" />
      <circle cx="9" cy="10" r="1.5" fill="#333" />
      <circle cx="15" cy="10" r="1.5" fill="#333" />
      <path d="M8 14.5c1 2 7 2 8 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  슬픔: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#6C8EBF" />
      <circle cx="9" cy="10" r="1.5" fill="#333" />
      <circle cx="15" cy="10" r="1.5" fill="#333" />
      <path d="M8 16.5c1-2 7-2 8 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 13l1 3" stroke="#8BB8E8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  보통: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#A8C5A0" />
      <circle cx="9" cy="10" r="1.5" fill="#333" />
      <circle cx="15" cy="10" r="1.5" fill="#333" />
      <line x1="8.5" y1="15.5" x2="15.5" y2="15.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  짜증: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#F4A261" />
      <path d="M7.5 8.5l2.5 1.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 8.5l-2.5 1.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="11" r="1.5" fill="#333" />
      <circle cx="15" cy="11" r="1.5" fill="#333" />
      <path d="M8.5 16c1-1.5 6-1.5 7 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  화남: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#E76F51" />
      <path d="M7 8l3.5 2.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 8l-3.5 2.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9.5" cy="11.5" r="1.5" fill="#333" />
      <circle cx="14.5" cy="11.5" r="1.5" fill="#333" />
      <path d="M8 16.5c1-2.5 7-2.5 8 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function EmotionIcon({ feel, size = 20 }: Props) {
  const icon = icons[feel as Feel];
  if (!icon) return null;
  return (
    <span style={{ width: size, height: size, display: 'inline-flex' }}>
      {icon}
    </span>
  );
}
