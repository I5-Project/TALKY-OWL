'use client';

import Modal from './Modal';
import Button from './Button';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({ open, message, onClose, onConfirm }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="outline" size="sm" onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm}>
          확인
        </Button>
      </div>
    </Modal>
  );
}
