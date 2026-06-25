# DESIGN.md

TALKY-OWL 디자인 시스템 가이드

---

## 1. 스타일 기술 스택

```txt
스타일링:     SCSS / SCSS Module
폰트:        Pretendard
아이콘:       @mui/icons-material (감정일기 제외), lucide-react (감정일기 전용)
차트:        recharts v3
단위 변환:    px → rem (r() 함수)
```

---

## 2. 컬러 팔레트

### Primary (민트/청록 계열)

| 토큰 | 값 | 용도 |
|------|----|------|
| `$color-primary-100` | `#eff8f6` | 배경 (surface-soft, 감정 happy, 카테고리 가족) |
| `$color-primary-200` | `#ddefea` | 배경 (brand-soft) |
| `$color-primary-300` | `#a8d6d0` | — |
| `$color-primary-400` | `#97cac3` | — |
| `$color-primary-500` | `#87bfb6` | 브랜드 기본 (텍스트, 아이콘, 보더) |
| `$color-primary-600` | `#72aea6` | 버튼 hover |
| `$color-primary-700` | `#5e9d96` | 버튼 기본, 상태 완료 텍스트, 카테고리 가족 텍스트 |

### Secondary (코랄/주황 계열)

| 토큰 | 값 | 용도 |
|------|----|------|
| `$color-secondary-100` | `#f5d4c8` | 배경 (카테고리 연애, 감정 angry, 상태 danger) |
| `$color-secondary-200` | `#f0c0b1` | — |
| `$color-secondary-300` | `#ebad9a` | — |
| `$color-secondary-400` | `#e79a83` | 텍스트 danger, 보더 danger |
| `$color-secondary-500` | `#da846a` | — |
| `$color-secondary-600` | `#cd6f52` | 카테고리 연애 텍스트, 상태 danger 텍스트 |
| `$color-secondary-700` | `#c05a3a` | 감정 angry 아이콘 |

### Amber (노란 계열)

| 토큰 | 값 | 용도 |
|------|----|------|
| `$color-amber` | `#e3b85e` | 상태 진행중 텍스트, 감정 neutral 아이콘, 카테고리 친구 텍스트 |
| `$color-amber-soft` | `#fbf0d8` | 상태 진행중 배경, 감정 neutral 배경, 카테고리 친구 배경 |

### 보조 컬러

| 토큰 | 값 | 용도 |
|------|----|------|
| `$color-third-100` | `#f6f1e7` | — |
| `$color-third-300` | `#e9f2d8` | 감정 annoyed 배경 |
| `$color-fourth-500` | `#7b6a58` | 감정 annoyed 아이콘 |
| `$color-fifth-100` | `#ebf0f7` | 카테고리 직장 배경, 감정 sad 배경 |
| `$color-fifth-500` | `#5b7fa6` | 카테고리 직장 텍스트, 감정 sad 아이콘 |

### Neutral (블랙 스케일)

| 토큰 | 값 | 용도 |
|------|----|------|
| `$color-black-100` | `#e6e9ec` | 보더 기본, 비활성 배경, 비활성 아이콘 |
| `$color-black-200` | `#d7dbde` | — |
| `$color-black-300` | `#c9cdd1` | 보더 strong, 보조 텍스트/아이콘 |
| `$color-black-400` | `#7f8387` | 비활성 텍스트 |
| `$color-black-500` | `#353a3d` | 기본 텍스트, 기본 아이콘 |
| `$color-black-600` | `#272b2e` | — |
| `$color-black-700` | `#1a1d1f` | — |

---

## 3. 시맨틱 토큰 (CSS Custom Properties)

SCSS 변수를 직접 사용하지 않고, `:root`에 선언된 CSS 변수를 통해 의미 기반으로 참조한다.

### 텍스트

```txt
--text-primary          기본 텍스트
--text-secondary         보조 텍스트
--text-tertiary          3차 텍스트
--text-inverse           반전 텍스트 (흰색)
--text-brand             브랜드 텍스트
--text-danger            위험/경고 텍스트
--text-button-primary    기본 버튼 텍스트 (흰색)
--text-disabled          비활성 텍스트
```

### 배경

```txt
--bg-page                페이지 배경
--bg-surface             카드/패널 배경
--bg-surface-soft        연한 배경
--bg-brand               브랜드 배경
--bg-brand-soft          브랜드 연한 배경
--bg-warning             경고 배경
--bg-disabled            비활성 배경
--bg-button-primary      기본 버튼 배경
--bg-button-primary-hover  기본 버튼 hover 배경
```

### 보더

```txt
--border-default         기본 보더
--border-strong          강조 보더
--border-brand           브랜드 보더
--border-danger          위험 보더
```

### 아이콘

```txt
--icon-primary           기본 아이콘
--icon-secondary         보조 아이콘
--icon-brand             브랜드 아이콘
--icon-disabled          비활성 아이콘
```

### 상태 (Status)

```txt
--status-progress-bg     진행중 배경
--status-progress-text   진행중 텍스트
--status-done-bg         완료 배경
--status-done-text       완료 텍스트
--status-disabled-bg     비활성 배경
--status-disabled-text   비활성 텍스트
--status-danger-bg       위험 배경
--status-danger-text     위험 텍스트
```

### 카테고리

```txt
--category-love-bg       연애 배경
--category-love-text     연애 텍스트
--category-work-bg       직장 배경
--category-work-text     직장 텍스트
--category-friend-bg     친구 배경
--category-friend-text   친구 텍스트
--category-family-bg     가족 배경
--category-family-text   가족 텍스트
```

### 감정 (Emotion)

```txt
--emotion-happy-bg       행복 배경
--emotion-happy-icon     행복 아이콘
--emotion-sad-bg         슬픔 배경
--emotion-sad-icon       슬픔 아이콘
--emotion-neutral-bg     보통 배경
--emotion-neutral-icon   보통 아이콘
--emotion-annoyed-bg     짜증 배경
--emotion-annoyed-icon   짜증 아이콘
--emotion-angry-bg       화남 배경
--emotion-angry-icon     화남 아이콘
```

### 결과 유형 카드

```txt
--type-card-01 ~ --type-card-16
16가지 AI 판결 결과 유형별 카드 배경색
```

---

## 4. 타이포그래피

### 폰트

```txt
폰트 패밀리: Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
기본 크기:   16px
```

### 텍스트 스케일

| 이름 | 크기 (rem) | 원본 (px) | 굵기 | 행간 (rem) | mixin |
|------|-----------|----------|------|-----------|-------|
| Display | 2.5rem | 40px | Bold (700) | 3rem | `@include m.text-display` |
| Title XL | 1.75rem | 28px | Bold (700) | 2.25rem | `@include m.text-title-xl` |
| Title L | 1.5rem | 24px | Bold (700) | 2rem | `@include m.text-title-l` |
| Title M | 1.25rem | 20px | SemiBold (600) | 1.75rem | `@include m.text-title-m` |
| Title S | 1.125rem | 18px | SemiBold (600) | 1.5rem | `@include m.text-title-s` |
| Body L | 1.125rem | 18px | Medium (500) | 1.75rem | `@include m.text-body-l` |
| Body M | 1rem | 16px | Regular (400) | 1.75rem | `@include m.text-body-m` |
| Body S | 0.875rem | 14px | Regular (400) | 1.5rem | `@include m.text-body-s` |
| Caption | 0.75rem | 12px | Regular (400) | 1.25rem | `@include m.text-caption` |
| Label M | 1rem | 16px | Medium (500) | 1.5rem | `@include m.text-label-m` |
| Label S | 0.75rem | 12px | SemiBold (600) | 1rem | `@include m.text-label-s` |
| Value M | 1rem | 16px | Regular (400) | 1.5rem | `@include m.text-value-m` |

### Font Weight

```txt
Regular:    400
Medium:     500
SemiBold:   600
Bold:       700
ExtraBold:  800
```

---

## 5. 레이아웃

### 기본 구조

```txt
최대 너비:   768px (모바일 우선)
최소 높이:   100dvh
수평 정렬:   margin: 0 auto
스페이싱 단위: 8px ($spacing-unit)
```

### 반응형 브레이크포인트

```txt
sm:  480px 이상
md:  768px 이상
lg:  1024px 이상
```

모바일 퍼스트 설계로, 기본 스타일은 모바일 기준이며 `@include m.respond-to('md')` 등으로 확장한다.

---

## 6. SCSS 사용 규칙

### import 규칙

```scss
@use '@/styles/abstracts/variables' as v;
@use '@/styles/abstracts/functions' as fn;
@use '@/styles/abstracts/mixins' as m;
```

- 반드시 `@/` 절대경로를 사용한다.
- 상대경로(`../`)를 사용하지 않는다.

### 유틸 함수

```scss
// px → rem 변환
fn.r(24)   // → 1.5rem
fn.r(16)   // → 1rem
```

### mixin 사용

```scss
// 중앙 정렬
@include m.flex-center;

// 타이포그래피
@include m.text-title-m;
@include m.text-body-s;

// 반응형
@include m.respond-to('md') {
  // 768px 이상 스타일
}
```

---

## 7. 공통 컴포넌트 목록

### UI 기본 (`src/components/ui/`)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| Button | `Button.tsx` | 공통 버튼 |
| Input | `Input.tsx` | 텍스트 입력 |
| Textarea | `Textarea.tsx` | 멀티라인 입력 |
| Select | `Select.tsx` | 셀렉트 박스 |
| Modal | `Modal.tsx` | 모달 |
| ConfirmModal | `ConfirmModal.tsx` | 확인/취소 모달 |
| Spinner | `Spinner.tsx` | 로딩 스피너 |
| Tab / Tabs | `Tab.tsx`, `Tabs.tsx` | 탭 UI |
| Avatar | `Avatar.tsx` | 아바타 |
| StatusBadge | `StatusBadge.tsx` | 상태 뱃지 |
| CategoryFilter | `CategoryFilter.tsx` | 카테고리 필터 |
| CategoryIcon | `CategoryIcon.tsx` | 카테고리 아이콘 |
| BackButton | `BackButton.tsx` | 뒤로가기 버튼 |
| ActionPrompt | `ActionPrompt.tsx` | 행동 유도 UI |
| CaseCard | `CaseCard.tsx` | 사건 카드 |
| CaseRecordCard | `CaseRecordCard.tsx` | 사건 기록 카드 |
| JoinStatusView | `JoinStatusView.tsx` | 참여 상태 뷰 |

### 레이아웃 (`src/components/layout/`)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| Header | `Header.tsx` | 상단 헤더 |
| SetHeader | `SetHeader.tsx` | 헤더 설정 |
| BottomNavigation | `BottomNavigation.tsx` | 하단 탭 네비게이션 |

### 피드백 (`src/components/feedback/`)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| Toast | `Toast.tsx` | 토스트 알림 (MUI Snackbar 래핑) |

### 달력 (`src/components/calendar/`)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| CalendarView | `CalendarView.tsx` | 달력 뷰 (MUI X Date Pickers 래핑) |
| EmotionIcon | `EmotionIcon.tsx` | 감정 아이콘 |
| RecordList | `RecordList.tsx` | 기록 리스트 |

---

## 8. 아이콘 사용 규칙

```txt
기본 아이콘:   @mui/icons-material (감정일기 기능 제외 전체 사용)
감정일기 아이콘: lucide-react (감정일기 기능 내에서만 사용)
```

MUI 아이콘과 lucide-react를 혼용하지 않는다. 각 기능 영역에 맞는 라이브러리만 사용한다.

---

## 9. MUI 사용 제한

```txt
허용 범위:
  - src/components/calendar/  → MUI X Date Pickers
  - src/components/feedback/  → MUI Snackbar
  - @mui/icons-material       → 감정일기 제외 전체 허용

금지 사항:
  - MUI ThemeProvider 전역 적용 금지
  - 허용 폴더 외부에서 MUI 컴포넌트 직접 import 금지
  - MUI sx prop / styled()는 래핑 컴포넌트 내부로 제한
  - 전역 스타일에 MUI 의존 스타일 추가 금지
```

---

## 10. CSS Reset

프로젝트 전역에 아래 기본 리셋이 적용되어 있다.

```txt
- box-sizing: border-box (전체)
- margin/padding: 0 (전체)
- list-style: none (ul, ol)
- text-decoration: none (a)
- button: cursor pointer, no background/border
- img: display block, max-width 100%
```
