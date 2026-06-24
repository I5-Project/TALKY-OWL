'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { DisputeParticipantDto } from '@/types/dispute';
import type { GiftItemDto } from '@/types/gift';
import { MBTI_OPTIONS } from '@/domains/user/constants';
import { useGiftRecommendation } from '@/domains/gift/gift.hooks';
import { useToastStore } from '@/stores/toastStore';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ActionPrompt from '@/components/ui/ActionPrompt';
import styles from './GiftRecommendation.module.scss';

interface Props {
  disputeId: string;
  opponentName: string;
  opponentParticipant: DisputeParticipantDto | undefined;
}

export default function GiftRecommendation({ disputeId, opponentName, opponentParticipant }: Props) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [form, setForm] = useState({ gender: '', age: '', mbti: '' });
  const [giftItem, setGiftItem] = useState<GiftItemDto | null>(null);

  const { mutate: fetchGift, isPending } = useGiftRecommendation();
  const showToast = useToastStore((s) => s.show);

  const handleGiftSubmit = () => {
    const ageNum = Number(form.age);
    if (!form.age || ageNum < 10 || ageNum > 100) {
      showToast('나이의 범위는 10~100까지 입니다');
      return;
    }
    fetchGift(
      { disputeId, gender: form.gender, age: form.age, mbti: form.mbti },
      {
        onSuccess: (data) => {
          setGiftItem(data);
          setShowInfoModal(false);
          setShowResultModal(true);
        },
        onError: () => {
          showToast('해당 조건의 상품이 없습니다.');
        },
      },
    );
  };

  const ageDecade = form.age ? Math.floor(Number(form.age) / 10) * 10 : null;
  const genderLabel = form.gender === 'male' ? '남성이' : form.gender === 'female' ? '여성이' : '사람이';
  const giftDesc = [
    form.mbti ? `${form.mbti}의 ` : '',
    ageDecade ? `${ageDecade}대 ` : '',
    genderLabel,
    ' 좋아할만한',
  ].join('');

  return (
    <>
      <button
        type="button"
        className={styles.reconcileIconBtn}
        onClick={() => setShowInfoModal(true)}
        aria-label="선물 추천받기"
      >
        <Image
          src="/images/characters/character-gift.svg"
          alt=""
          width={52}
          height={52}
        />
      </button>

      {/* ── 선물 정보 입력 모달 ── */}
      <Modal open={showInfoModal} onClose={() => setShowInfoModal(false)} paperClassName={styles.giftInfoModalPaper}>
        <h2 className={styles['giftModal__title']}>
          {opponentName}{opponentName !== '상대방' ? '님' : ''}이 좋아할 선물을<br />추천해 드릴게요
        </h2>
        <div className={styles['giftModal__form']}>
          <Select
            placeholder="성별을 선택해주세요"
            options={[
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' },
            ]}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className={styles['giftModal__selectTrigger']}
          />
          <div className={styles['giftModal__ageWrapper']}>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="나이를 입력해주세요"
              value={form.age}
              maxLength={3}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val === '' || Number(val) <= 100) setForm({ ...form, age: val });
              }}
              className={styles['giftModal__ageInput']}
            />
            <span className={styles['giftModal__ageSuffix']}>세</span>
          </div>
          <Select
            placeholder="MBTI"
            options={[...MBTI_OPTIONS]}
            value={form.mbti}
            onChange={(e) => setForm({ ...form, mbti: e.target.value })}
            className={styles['giftModal__selectTrigger']}
          />
        </div>
        <ActionPrompt
          secondaryLabel="취소"
          onSecondary={() => setShowInfoModal(false)}
          primaryLabel={isPending ? '불러오는 중...' : '확인'}
          onPrimary={handleGiftSubmit}
          primaryDisabled={isPending}
          size="md"
        />
        <p className={styles['giftModal__privacyNote']}>작성한 내용은 개인정보를 수집하지 않습니다.</p>
      </Modal>

      {/* ── 선물 추천 결과 모달 ── */}
      <Modal open={showResultModal} onClose={() => setShowResultModal(false)} paperClassName={styles.giftResultModalPaper}>
        {isPending || !giftItem ? (
          <p className={styles['giftResult__loadingText']}>추천 선물을 찾고 있어요...</p>
        ) : (
          <>
            <h2 className={styles['giftResult__title']}>이런 선물 어떠세요?</h2>
            <div className={styles['giftResult__imageWrapper']}>
              {giftItem.imageUrl ? (
                <Image
                  src={giftItem.imageUrl}
                  alt={giftItem.itemName}
                  fill
                  className={styles['giftResult__image']}
                />
              ) : (
                <div className={styles['giftResult__imageFallback']}>
                  <span className={styles['giftResult__imageFallbackText']}>{giftItem.itemName}</span>
                </div>
              )}
              {opponentParticipant?.profileImageUrl && (
                <div className={styles['giftResult__avatar']}>
                  <Image
                    src={opponentParticipant.profileImageUrl}
                    alt=""
                    width={28}
                    height={28}
                    className={styles['giftResult__avatarImg']}
                  />
                </div>
              )}
            </div>
            <p className={styles['giftResult__desc']}>
              {giftDesc}<br />
              <span className={styles['giftResult__itemName']}>{giftItem.itemName}</span> 추천해드려요
            </p>
            <Button onClick={() => setShowResultModal(false)}>확인</Button>
          </>
        )}
      </Modal>
    </>
  );
}
