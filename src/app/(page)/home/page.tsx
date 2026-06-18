import { redirect } from 'next/navigation'

// 홈 페이지가 /에서 서빙되므로 기존 /home 경로 접근 시 리다이렉트
export default function HomeRedirect() {
  redirect('/')
}
