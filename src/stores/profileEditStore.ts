import { create } from 'zustand';

interface ProfileEditState {
  email: string;
  nickname: string;
  mbti: string;
  previewUrl: string | null;
  errors: Record<string, string>;
  setEmail: (email: string) => void;
  setNickname: (nickname: string) => void;
  setMbti: (mbti: string) => void;
  setPreviewUrl: (url: string | null) => void;
  setErrors: (errors: Record<string, string>) => void;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  reset: (initial?: { email?: string; nickname?: string; mbti?: string; previewUrl?: string | null }) => void;
}

export const useProfileEditStore = create<ProfileEditState>((set) => ({
  email: '',
  nickname: '',
  mbti: '',
  previewUrl: null,
  errors: {},
  setEmail: (email) => set({ email }),
  setNickname: (nickname) => set({ nickname }),
  setMbti: (mbti) => set({ mbti }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setErrors: (errors) => set({ errors }),
  setFieldError: (field, message) => set((state) => ({ errors: { ...state.errors, [field]: message } })),
  clearFieldError: (field) => set((state) => ({ errors: { ...state.errors, [field]: '' } })),
  reset: (initial) => set({
    email: initial?.email ?? '',
    nickname: initial?.nickname ?? '',
    mbti: initial?.mbti ?? '',
    previewUrl: initial?.previewUrl ?? null,
    errors: {},
  }),
}));
