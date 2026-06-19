import Modal from '@/components/ui/Modal'
import ActionPrompt from '@/components/ui/ActionPrompt'
import styles from './InviteChoiceModal.module.scss'

interface InviteChoiceModalProps {
  open: boolean
  onClose?: () => void
  onAlone: () => void
  onInvite: () => void
}

export default function InviteChoiceModal({
  open,
  onClose,
  onAlone,
  onInvite,
}: InviteChoiceModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.content}>
        <p className={styles.message}>
          정확한 결과를 위해{'\n'}상대를 초대해 판결을 진행하세요!
        </p>
        <ActionPrompt
          secondaryLabel="혼자서 진행"
          onSecondary={onAlone}
          primaryLabel="상대방 초대"
          onPrimary={onInvite}
          secondaryVariant="soft"
          size="sm"
        />
      </div>
    </Modal>
  )
}
