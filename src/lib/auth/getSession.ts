import { cache } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '.'

export const getCachedSession = cache(() => getServerSession(authOptions))
