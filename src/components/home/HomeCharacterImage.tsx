'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from '@/app/page.module.scss'

export default function HomeCharacterImage() {
  const [error, setError] = useState(false)

  if (error) return null

  return (
    <Image
      src="/images/characters/character-home.png"
      alt="말해부엉 캐릭터"
      width={169}
      height={138}
      className={styles.characterImage}
      onError={() => setError(true)}
    />
  )
}