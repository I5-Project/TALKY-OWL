import MuiDialog from '@mui/material/Dialog'
import styles from './Modal.module.scss'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  paperClassName?: string
}

export default function Modal({ open, onClose, children, paperClassName }: ModalProps) {
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { className: [styles.paper, paperClassName].filter(Boolean).join(' ') },
        backdrop: { className: styles.backdrop },
      }}
    >
      {children}
    </MuiDialog>
  )
}
