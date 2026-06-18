import MuiDialog from '@mui/material/Dialog'
import styles from './Modal.module.scss'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { className: styles.paper },
        backdrop: { className: styles.backdrop },
      }}
    >
      {children}
    </MuiDialog>
  )
}
