import Button from '@/components/ui/Button'
import styles from './join.module.scss'

export default function JoinPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.character}>
          {/* TODO: 판사 부엉이 이미지로 교체 */}
          <img
            src="/images/characters/character-welcome.png"
            alt="말해부엉 판사"
          />
        </div>
        <p className={styles.message}>
          <span className={styles.inviterName}>박정민</span>
          {'님이 OOO 사건으로\n진술을 요청했어요'}
        </p>
      </div>
      <div className={styles.footer}>
        <Button>진술하러 가기</Button>
      </div>
    </div>
  )
}
