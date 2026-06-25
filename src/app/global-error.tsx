'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh', padding: '40px 20px 32px', backgroundColor: '#ffffff', fontFamily: 'sans-serif', margin: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', height: '52px', padding: '0 4px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/common/logo.svg" alt="말해부엉" width={66} height={19} />
        </header>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/characters/character-error.svg" alt="" width={220} height={220} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#353a3d', textAlign: 'center', whiteSpace: 'pre-line', margin: 0 }}>
              {'앱에서 오류가\n발생했어요'}
            </h1>
            <p style={{ fontSize: '14px', color: '#7f8387', textAlign: 'center', margin: 0 }}>
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
          <button onClick={reset} style={{ width: '100%', height: '52px', borderRadius: '12px', backgroundColor: '#72aea6', color: '#ffffff', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            다시 시도하기
          </button>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back()
              } else {
                window.location.href = '/'
              }
            }}
            style={{ width: '100%', height: '52px', borderRadius: '12px', backgroundColor: '#5e9d96', color: '#ffffff', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            이전 페이지로 이동하기
          </button>
        </div>
      </body>
    </html>
  )
}
