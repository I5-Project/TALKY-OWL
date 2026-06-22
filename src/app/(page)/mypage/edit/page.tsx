'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeaderStore } from '@/stores/headerStore';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { useUserMe, useUpdateProfile } from '@/domains/user/hooks';
import { MBTI_OPTIONS } from '@/domains/user/constants';
import { useProfileEditStore } from '@/stores/profileEditStore';
import styles from './page.module.scss';

export default function ProfileEditPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader)
  useEffect(() => {
    setHeader({ variant: 'title', title: '개인정보 수정', onBack: () => router.back() })
    return () => setHeader(null)
  }, [])
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading, isError, error } = useUserMe();
  const updateProfile = useUpdateProfile();

  const {
    email, nickname, mbti, previewUrl, errors,
    setEmail, setNickname, setMbti, setPreviewUrl,
    setErrors, setFieldError, clearFieldError, reset,
  } = useProfileEditStore();

  useEffect(() => {
    if (user) {
      reset({
        email: user.email ?? '',
        nickname: user.name ?? user.nickname ?? '',
        mbti: user.mbti ?? '',
        previewUrl: user.profileImageUrl,
      });
    }
  }, [user, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validate = () => {
    const next: Record<string, string> = {};

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = '올바른 이메일 형식이 아닙니다.';
    }

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname || trimmedNickname.length < 2 || trimmedNickname.length > 100) {
      next.nickname = '닉네임은 2~100자로 입력해주세요.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await updateProfile.mutateAsync({
        email: email || undefined,
        nickname: nickname.trim(),
        mbti: mbti || null,
        profileImage: fileInputRef.current?.files?.[0] ?? undefined,
      });

      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : '수정에 실패했습니다.';
      if (message.includes('닉네임')) {
        setFieldError('nickname', message);
      } else if (message.includes('이메일')) {
        setFieldError('email', message);
      } else {
        setFieldError('general', message);
      }
    }
  };

  const isSaving = updateProfile.isPending;

  if (isLoading) {
    return (
      <>
        <main className={styles.loading}>
          <Spinner />
        </main>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <main className={styles.loading}>
          <span>{error instanceof Error ? error.message : '사용자 정보를 불러오지 못했습니다.'}</span>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <main className={styles.loading}>
          <span>사용자 정보가 존재하지 않습니다.</span>
        </main>
      </>
    );
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.avatar}>
          <Avatar size="l" src={previewUrl ?? undefined} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
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
              clearFieldError('email');
            }}
            placeholder="이메일을 입력해주세요"
            error={errors.email || undefined}
          />

          <Input
            label="이름"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              clearFieldError('nickname');
            }}
            placeholder="닉네임을 입력해주세요"
            maxLength={100}
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
            <span className={styles.errorMessage}>
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
