import Button from '@/components/ui/Button'
import styles from './JoinStatusView.module.scss'

interface JoinStatusViewProps {
  character: React.ReactNode
  message: React.ReactNode
  buttonLabel: string
  onButtonClick?: () => void
}

export default function JoinStatusView({
  character,
  message,
  buttonLabel,
  onButtonClick,
}: JoinStatusViewProps) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.character}>{character}</div>
        <p className={styles.message}>{message}</p>
      </div>
      <div className={styles.footer}>
        <Button onClick={onButtonClick}>{buttonLabel}</Button>
      </div>
    </div>
  )
}
