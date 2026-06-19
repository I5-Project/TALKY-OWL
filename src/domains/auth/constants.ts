import { TermsType } from '@prisma/client'

export const CURRENT_TERMS_VERSIONS: Record<string, { type: TermsType; version: string; isRequired: boolean }> = {
  SERVICE: { type: TermsType.SERVICE, version: '2026-06-18', isRequired: true },
  PRIVACY: { type: TermsType.PRIVACY, version: '2026-06-18', isRequired: true },
}
