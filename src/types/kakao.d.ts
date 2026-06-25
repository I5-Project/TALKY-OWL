interface Window {
  Kakao: {
    init: (key: string | undefined) => void
    isInitialized: () => boolean
    Share: {
      sendDefault: (settings: KakaoShareSettings) => void
    }
  }
}

interface KakaoShareSettings {
  objectType: 'feed'
  content: {
    title: string
    description: string
    imageUrl: string
    link: KakaoLink
  }
  buttons?: Array<{
    title: string
    link: KakaoLink
  }>
}

interface KakaoLink {
  mobileWebUrl: string
  webUrl: string
}
