'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { EmotionType } from '@/types/diary';
import styles from '@/app/(page)/diary/create/page.module.scss';
import CategoryFilter from '@/components/ui/CategoryFilter';

const EMOTIONS: { type: EmotionType; label: string }[] = [
  { type: 'happy', label: '기쁨' },
  { type: 'sad', label: '슬픔' },
  { type: 'neutral', label: '보통' },
  { type: 'annoyed', label: '짜증' },
  { type: 'angry', label: '화남' },
];

export default function DiaryCreate() {
  const [emotion, setEmotion] = useState<EmotionType>(EMOTIONS[1].type);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className={styles['create-diary']}>
      <h2 className={styles['create-diary__title']}>감정 선택</h2>

      <CategoryFilter mode="emotion" value={emotion} onChange={setEmotion} />

      <div className={styles['create-diary__section']}>
        <h2 className={styles['create-diary__title']}>일기 작성</h2>
        <div className={styles['create-diary__form']}>
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder={'사건내용을 작성해주세요.\n욕설의 경우 가리기 처리 될 수 있어요'}
            maxLength={1000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles['create-diary__textarea']}
          />
        </div>
      </div>

      <Button variant="primary" size="md" className={styles['create-diary__submit']}>
        작성하기
      </Button>
    </div>
  );
}
