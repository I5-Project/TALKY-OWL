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
import { useUserMe, useUpdateProfile } from '@/domains/user/hooks';
import { MBTI_OPTIONS } from '@/domains/user/constants';
import styles from './page.module.scss';

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading } = useUserMe();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [mbti, setMbti] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setNickname(user.nickname ?? '');
      setMbti(user.mbti ?? '');
      setPreviewUrl(null);
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

    const trimmedName = name.trim();
    if (trimmedName && (trimmedName.length < 1 || trimmedName.length > 50)) {
      next.name = '이름은 1~50자로 입력해주세요.';
    }

    const trimmedNickname = nickname.trim();
    if (trimmedNickname && (trimmedNickname.length < 2 || trimmedNickname.length > 20)) {
      next.nickname = '닉네임은 2~20자로 입력해주세요.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const params: Record<string, string | null> = {};

      const trimmedName = name.trim();
      if (trimmedName !== (user?.name ?? '')) {
        params.name = trimmedName;
      }

      const trimmedNickname = nickname.trim();
      if (trimmedNickname !== (user?.nickname ?? '')) {
        params.nickname = trimmedNickname;
      }

      if (mbti !== (user?.mbti ?? '')) {
        params.mbti = mbti || null;
      }

      if (Object.keys(params).length === 0) {
        router.back();
        return;
      }

      await updateProfile.mutateAsync(params as Parameters<typeof updateProfile.mutateAsync>[0]);
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : '수정에 실패했습니다.';
      if (message.includes('닉네임')) {
        setErrors((prev) => ({ ...prev, nickname: message }));
      } else if (message.includes('이름')) {
        setErrors((prev) => ({ ...prev, name: message }));
      } else {
        setErrors((prev) => ({ ...prev, general: message }));
      }
    }
  };

  const isSaving = updateProfile.isPending;

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
            label="이름"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="이름을 입력해주세요"
            maxLength={50}
            error={errors.name || undefined}
          />

          <Input
            label="닉네임"
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
            label="MBTI"
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
