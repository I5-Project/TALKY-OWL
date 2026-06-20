'use client'

import Link from 'next/link'
import MuiAvatar from '@mui/material/Avatar'
import MuiAvatarGroup from '@mui/material/AvatarGroup'
import CaseCard from '@/components/ui/CaseCard'
import StatusBadge, { type DisputeStatus } from '@/components/ui/StatusBadge'
import type { CategoryGroup } from '@/types/common'
import styles from './CaseRecordCard.module.scss'

interface Participant {
  profileImageUrl?: string | null
}

interface Props {
  href: string
  title: string
  description?: string | null
  categoryGroup: CategoryGroup
  status: DisputeStatus
  createdAt: string
  participants: Participant[]
}

function formatDate(dateStr: string): string {
  return dateStr.slice(2, 10)
}

export default function CaseRecordCard({
  href,
  title,
  description,
  categoryGroup,
  status,
  createdAt,
  participants,
}: Props) {
  const date = formatDate(createdAt)

  return (
    <Link href={href} className={styles.wrapper}>
      <CaseCard
        title={title}
        preview={description ?? ''}
        date={date}
        categoryGroup={categoryGroup}
      />
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <MuiAvatarGroup
            max={2}
            sx={{
              '& .MuiAvatar-root': {
                width: 24,
                height: 24,
                fontSize: 10,
                border: '1.5px solid var(--bg-surface)',
              },
            }}
          >
            {participants.map((p, i) => (
              <MuiAvatar
                key={i}
                src={p.profileImageUrl ?? '/images/common/thumbnail-default.png'}
                sx={{ width: 24, height: 24 }}
              />
            ))}
          </MuiAvatarGroup>
          <time className={styles.date}>{date}</time>
        </div>
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}
