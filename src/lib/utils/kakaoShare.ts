export function shareDisputeResult(
  disputeId: string,
  title?: string,
  description?: string,
  imageUrl?: string,
) {
  if (typeof window === 'undefined' || !window.Kakao) return

  if (!window.Kakao.isInitialized()) {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    if (!kakaoKey) return
    window.Kakao.init(kakaoKey)
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin
  const shareUrl = `${baseUrl}/disputes/${encodeURIComponent(disputeId)}`
  const resolvedImageUrl = imageUrl ?? `${baseUrl}/images/common/ogimg.jpg`

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: title ?? '갈등 판결 결과를 확인해보세요!',
      description: description ?? '나의 갈등 상황, AI가 판단했어요. 당신은 어떻게 생각하나요?',
      imageUrl: resolvedImageUrl,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
    },
    buttons: [
      {
        title: '결과 보러가기',
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
    ],
  })
}
