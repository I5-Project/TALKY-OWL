'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { useUserMe, useUpdateProfile, useUploadProfileImage } from '@/domains/user/hooks';
import { MBTI_OPTIONS } from '@/domains/user/constants';
import styles from './page.module.scss';

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading } = useUserMe();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [mbti, setMbti] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? '');
      setNickname(user.nickname ?? '');
      setMbti(user.mbti ?? '');
      setPreviewUrl(user.profileImageUrl);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = '올바른 이메일 형식이 아닙니다.';
    }

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname || trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      next.nickname = '닉네임은 2~20자로 입력해주세요.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        await uploadImage.mutateAsync(file);
      }

      await updateProfile.mutateAsync({
        email: email || undefined,
        nickname: nickname.trim(),
        mbti: mbti || null,
      });

      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : '수정에 실패했습니다.';
      if (message.includes('닉네임')) {
        setErrors((prev) => ({ ...prev, nickname: message }));
      } else if (message.includes('이메일')) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else {
        setErrors((prev) => ({ ...prev, general: message }));
      }
    }
  };

  const isSaving = updateProfile.isPending || uploadImage.isPending;

  if (isLoading) {
    return (
      <>
        <Header title="개인정보 수정" onBack={() => router.back()} />
        <main className={styles.loading}>
          <Spinner />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="개인정보 수정" onBack={() => router.back()} />
      <main className={styles.main}>
        <div className={styles.avatar}>
          <Avatar size="l" src={previewUrl ?? undefined} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={styles.avatar__button}
            onClick={() => fileInputRef.current?.click()}
          >
            <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />
            사진 변경
          </button>
        </div>

        <div className={styles.form}>
          <Input
            label="계정"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="이메일을 입력해주세요"
            error={errors.email || undefined}
          />

          <Input
            label="이름"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setErrors((prev) => ({ ...prev, nickname: '' }));
            }}
            placeholder="닉네임을 입력해주세요"
            maxLength={20}
            error={errors.nickname || undefined}
          />

          <Select
            label="MBTI 변경"
            options={[...MBTI_OPTIONS]}
            value={mbti}
            onChange={(e) => setMbti(e.target.value)}
            placeholder="MBTI를 선택해주세요"
          />

          {errors.general && (
            <span style={{ color: 'var(--text-danger)', fontSize: '0.875rem' }}>
              {errors.general}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </main>
    </>
  );
}
