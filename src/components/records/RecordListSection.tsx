'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CategoryFilter, { type Category } from '@/components/ui/CategoryFilter';
import CaseRecordCard from '@/components/ui/CaseRecordCard';
import Spinner from '@/components/ui/Spinner';
import { useCompletedCases } from '@/domains/dispute/dispute.hooks';
import type { CategoryGroup } from '@/types/common';
import styles from './RecordListSection.module.scss';

export default function RecordListSection() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  const categoryGroup =
    selectedCategory === 'all' ? undefined : (selectedCategory as CategoryGroup);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCompletedCases(categoryGroup);

  const records = data?.pages.flatMap((p) => p.disputes) ?? [];

  useEffect(() => {
    if (!bottomRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <section className={styles.section}>
      <div className={styles.filterWrapper}>
        <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {isLoading ? (
        <div className={styles.center}>
          <Spinner />
        </div>
      ) : isError ? (
        <p className={styles.empty}>사건 기록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
      ) : records.length === 0 ? (
        <div className={styles.empty}>
          <Image src="/images/characters/character-case.svg" alt="" width={150} height={150} />
          <p className={styles.emptyText}>등록한 사건이 없어요</p>
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            {records.map((record) => (
              <li key={record.id}>
                <CaseRecordCard
                  href={`/disputes/${record.id}`}
                  title={record.title}
                  description={record.description}
                  categoryGroup={record.categoryGroup}
                  status={record.status}
                  createdAt={record.createdAt}
                  participants={record.participants}
                />
              </li>
            ))}
          </ul>

          <div ref={bottomRef} className={styles.bottomObserver}>
            {isFetchingNextPage && <Spinner />}
            {!hasNextPage && <p className={styles.allLoaded}>모든 데이터를 불러왔습니다</p>}
          </div>
        </>
      )}
    </section>
  );
}
