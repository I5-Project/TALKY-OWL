'use client';

import { useState } from 'react';

type DiaryTab = 'emotion' | 'record';

const tabMode: { key: DiaryTab; label: string }[] = [
  { key: 'emotion', label: '감정일기' },
  { key: 'record', label: '사건기록' },
];

const tabResult: Record<DiaryTab, React.ReactNode> = {
  emotion: <div>등록한 일기가 없어요 (감정일기)</div>,
  record: <div>등록한 기록이 없어요 (사건기록)</div>,
};

export default function DiaryMode() {
  const [diaryTabMode, setDiaryTab] = useState<DiaryTab>('emotion');

  return (
    <div>
      <div className='diary-tab'>
        {tabMode.map((tab) => (
          <button
            key={tab.key}
            className={diaryTabMode === tab.key ? 'active' : ''}
            onClick={() => setDiaryTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabResult[diaryTabMode]}</div>
    </div>
  );
}
