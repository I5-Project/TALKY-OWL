'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionPrompt from '@/components/ui/ActionPrompt';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useDeleteDiary } from '@/domains/diary/diary.hooks';
import styles from './DiaryActions.module.scss';

interface DiaryActionsProps {
  diaryId: string;
  diaryDate: string;
  className?: string;
}

export default function DiaryActions({ diaryId, diaryDate, className }: DiaryActionsProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteMutation = useDeleteDiary(diaryDate);

  const handleEdit = () => {
    router.push(`/diary/${diaryId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(diaryId, {
      onError: () => setShowDeleteModal(false),
    });
  };

  return (
    <>
      <ActionPrompt
        secondaryLabel="삭제"
        onSecondary={handleDelete}
        primaryLabel="수정"
        onPrimary={handleEdit}
        secondaryVariant="outline"
        className={className}
      />

      <Modal open={showDeleteModal} onClose={() => !deleteMutation.isPending && setShowDeleteModal(false)}>
        <div className={styles.modalContent}>
          <p className={styles.modalTitle}>일기를 삭제하시겠습니까?</p>
          <div className={styles.modalButtons}>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              취소
            </Button>
            <Button onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
