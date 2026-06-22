'use client';

import Image from 'next/image';
import styles from '@/app/(page)/diary/[id]/page.module.scss';
import ActionPrompt from '@/components/ui/ActionPrompt';

export default function Diary() {
  const handleEdit = () => {
    console.log('수정 클릭');
  };

  const handleDelete = () => {
    console.log('삭제 클릭');
  };
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
          delectus exercitationem. Rerum doloribus pariatur hic facere! Lorem ipsum dolor sit amet,
          consectetur adipisicing elit. Quas veritatis distinctio voluptas, dolor nulla nam,
          corporis sunt adipisci veniam perspiciatis odit. Natus veniam delectus exercitationem.
          Rerum doloribus pariatur hic facere! Lorem ipsum dolor sit amet, consectetur adipisicing
          elit. Quas veritatis distinctio voluptas, dolor nulla nam, corporis sunt adipisci veniam
          perspiciatis odit. Natus veniam delectus exercitationem. Rerum doloribus pariatur hic
          facere! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas veritatis
          distinctio voluptas, dolor nulla nam, corporis sunt adipisci veniam perspiciatis odit.
          Natus veniam delectus exercitationem. Rerum doloribus pariatur hic facere! Lorem ipsum
          dolor sit amet, consectetur adipisicing elit. Quas veritatis distinctio voluptas, dolor
          nulla nam, corporis sunt adipisci veniam perspiciatis odit. Natus veniam delectus
          exercitationem. Rerum doloribus pariatur hic facere!
        </div>

        <time className={styles['diary__createdAt']}>26-06-14</time>
      </div>

      <div className={styles['diary__actions']}>
        <ActionPrompt
          secondaryLabel="삭제"
          onSecondary={handleDelete}
          primaryLabel="수정"
          onPrimary={handleEdit}
          secondaryVariant="outline"
          className={styles.diaryActions}
        />
      </div>
    </div>
  );
}
