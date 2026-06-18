const VERBS = [
  '날아다니는', '잠자는', '노래하는', '춤추는', '달리는',
  '웃는', '생각하는', '먹는', '빛나는', '졸고있는',
  '반짝이는', '행복한', '신나는', '귀여운', '멋진',
  '느긋한', '용감한', '씩씩한', '지혜로운', '엉뚱한',
]

export function generateNickname(): string {
  const verb = VERBS[Math.floor(Math.random() * VERBS.length)]
  const digits = String(Math.floor(Math.random() * 9000) + 1000)
  return `${verb}부엉이${digits}`
}
