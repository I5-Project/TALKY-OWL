'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import type { EmotionType, DiaryDetail } from '@/types/diary';
import styles from '@/app/(page)/diary/create/page.module.scss';
import CategoryFilter from '@/components/ui/CategoryFilter';
import { useCreateDiary, useUpdateDiary } from '@/domains/diary/diary.hooks';
import Spinner from '@/components/ui/Spinner';

interface DiaryCreateProps {
  mode?: 'create' | 'edit';
  diary?: DiaryDetail;
}

export default function DiaryCreate({ mode = 'create', diary }: DiaryCreateProps) {
  const router = useRouter();
  const [emotion, setEmotion] = useState<EmotionType>(
    (diary?.emotionType as EmotionType) ?? 'neutral',
  );
  const [title, setTitle] = useState(diary?.title ?? '');
  const [content, setContent] = useState(diary?.content ?? '');

  const createMutation = useCreateDiary();
  const updateMutation = useUpdateDiary(diary?.diaryDate ?? '');

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;

    if (mode === 'create') {
      const diaryDate = new Date().toISOString().slice(0, 10);
      createMutation.mutate({ title, content, emotionType: emotion, diaryDate }, {
        onError: (error) => {
          if (error.message === 'DIARY_LIMIT_EXCEEDED') setLimitModalOpen(true);
        },
      });
    } else {
      updateMutation.mutate({
        id: diary!.id,
        body: { title, content, emotionType: emotion },
      });
    }
  };

  return (
    <>
      <Header
        variant="title"
        title={mode === 'create' ? '일기 작성' : '일기 수정'}
        onBack={() => router.push('/calendar')}
      />
      <div className={styles['create-diary']}>
        <h2 className={styles['create-diary__title']}>감정 선택</h2>

        <CategoryFilter mode="emotion" value={emotion} onChange={setEmotion} />

        <div className={styles['create-diary__section']}>
          <h2 className={styles['create-diary__title']}>일기 작성</h2>
          <div className={styles['create-diary__form-area']}>
            <div className={`${styles['create-diary__form']} ${isPending ? styles['create-diary__form--loading'] : ''}`}>
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
            {isPending && (
              <div className={styles['create-diary__spinner-overlay']}>
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          className={styles['create-diary__submit']}
          onClick={handleSubmit}
          disabled={isPending || isSuccess || !content.trim()}
        >
          {mode === 'create' ? '작성하기' : '수정하기'}
        </Button>
      </div>

      <Modal open={limitModalOpen} onClose={() => setLimitModalOpen(false)}>
        <div className={styles['create-diary__modal-content']}>
          <p>하루에 같은 카테고리 3개 이상은 등록할 수 없습니다.</p>
          <Button variant="primary" size="md" onClick={() => setLimitModalOpen(false)}>
            확인
          </Button>
        </div>
      </Modal>
    </>
  );
}
