import Image from 'next/image';
import styles from './page.module.scss';
import Button from '@/components/ui/Button';

export default function Diary() {
  return (
    <div className={styles.diary}>
      <div className={styles['diary__body']}>
        <Image
          className={styles['diary__character']}
          src="/images/characters/character-closed.png"
          alt=""
          width={350}
          height={194}
        />

        <div className={styles['diary__title']}>지금 이건 테스트인가</div>

        <div className={styles['diary__content']}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas veritatis distinctio
          voluptas, dolor nulla nam, corporis sunt adipisci veniam perspiciatis odit. Natus veniam
          delectus exercitationem. Rerum doloribus pariatur hic facere!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas veritatis distinctio
          voluptas, dolor nulla nam, corporis sunt adipisci veniam perspiciatis odit. Natus veniam
          delectus exercitationem. Rerum doloribus pariatur hic facere!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas veritatis distinctio
          voluptas, dolor nulla nam, corporis sunt adipisci veniam perspiciatis odit. Natus veniam
          delectus exercitationem. Rerum doloribus pariatur hic facere!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas veritatis distinctio
          voluptas, dolor nulla nam, corporis sunt adipisci veniam perspiciatis odit. Natus veniam
          delectus exercitationem. Rerum doloribus pariatur hic facere!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas veritatis distinctio
          voluptas, dolor nulla nam, corporis sunt adipisci veniam perspiciatis odit. Natus veniam
          delectus exercitationem. Rerum doloribus pariatur hic facere!
          
        </div>

        <time className={styles['diary__createdAt']}>2026-06-14</time>
      </div>

      <div className={styles['diary__actions']}>
        <Button variant="outline">삭제</Button>
        <Button variant="primary">수정</Button>
      </div>
    </div>
  );
}
