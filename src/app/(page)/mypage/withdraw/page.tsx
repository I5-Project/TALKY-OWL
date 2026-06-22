'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useHeaderStore } from '@/stores/headerStore';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useUserMe } from '@/domains/user/hooks';
import styles from './page.module.scss';

const WITHDRAW_TERMS = [
  {
    title: '제1조 (회원탈퇴 목적 및 처리 방침)',
    paragraphs: [
      "본 안내문은 말해부엉(이하 '서비스') 서비스를 이용 중인 회원이 탈퇴를 원하는 경우, 탈퇴 절차 및 탈퇴에 따른 개인정보와 서비스 이용 데이터 처리에 관한 사항을 안내하기 위해 작성되었습니다.",
      '회원탈퇴란 말해부엉 서비스와 회원 사이의 이용 계약을 해지하는 것을 의미하며, 탈퇴 완료 이후에는 서비스 내 모든 기능의 이용이 전면 중단됩니다. 말해부엉 서비스는 AI 기반 갈등 조정 판결 서비스로, 회원이 갈등 상황을 AI와 함께 정리하고 단독 또는 1:1 방식으로 AI 판결을 받을 수 있는 서비스입니다.',
      '탈퇴는 사용자 본인이 직접 신청한 경우에 한해 처리되며, 본인 외 제3자가 타인의 탈퇴를 임의로 요청할 수 없습니다. 탈퇴 절차를 진행하기 전에 본 안내문 전체 내용을 충분히 읽고 탈퇴 여부를 신중하게 결정하시기 바랍니다. 탈퇴 완료 이후에는 어떠한 방법으로도 계정 및 서비스 이용 데이터를 복구할 수 없습니다.',
      '서비스는 개인정보 보호법 및 관계 법령에 따라 탈퇴 회원의 개인정보를 안전하게 처리하며, 법령에서 정한 보관 기간이 경과한 이후에는 모든 정보를 복구 불가능한 방법으로 영구 파기합니다. 본 처리 방침은 탈퇴 신청 시점과 동시에 효력이 발생하며, 탈퇴 확인 이후에는 처리를 취소할 수 없습니다.',
    ],
  },
  {
    title: '제2조 (탈퇴 후 개인정보 처리)',
    paragraphs: [
      '회원탈퇴가 완료되면 수집된 개인정보는 개인정보 보호법 및 관계 법령에 따라 처리됩니다. 다음의 기준에 따라 데이터가 파기되거나 보관됩니다.',
      '1. 카카오 소셜 로그인 연동 정보: 회원이 카카오 계정으로 말해부엉 서비스에 가입할 때 제공된 카카오 닉네임, 프로필 이미지, 카카오 고유 식별자 등의 정보는 탈퇴 완료 시 즉시 삭제됩니다. 단, 카카오 계정 자체는 말해부엉 서비스와 별도로 관리되며, 카카오 계정 탈퇴는 카카오 서비스를 통해 별도로 진행하셔야 합니다.',
      '2. 서비스 내 직접 입력 정보: 사용자가 서비스 내에서 직접 입력하거나 수정한 닉네임, MBTI, 프로필 이미지 등의 정보는 탈퇴 완료와 동시에 파기됩니다.',
      '3. 서비스 부정 이용 방지 및 법적 분쟁 해결을 위해 필요한 최소한의 정보는 탈퇴 후 6개월간 보관될 수 있습니다. 해당 기간이 경과한 후에는 관련 정보를 지체 없이 파기합니다.',
      '4. 관계 법령에 따른 의무 보관 사항: 전자상거래 등에서의 소비자 보호에 관한 법률 및 기타 관계 법령에서 일정 기간 보관을 의무화하는 정보는 법령에서 정한 기간 동안 별도로 보관한 후 파기됩니다. 보관 기간 중 해당 정보는 다른 목적으로 이용되지 않습니다.',
      '개인정보는 파기 시 복구 불가능한 방법으로 영구 삭제되며, 탈퇴 완료 이후에는 어떠한 사유로도 개인정보의 복구를 요청할 수 없습니다.',
    ],
  },
  {
    title: '제3조 (서비스 이용 기록 처리)',
    paragraphs: [
      '회원탈퇴 완료 후, 서비스 내 저장된 이용 기록은 다음과 같이 처리됩니다. 탈퇴 이전에 중요한 데이터는 반드시 별도로 저장해 두시기 바랍니다.',
      '1. AI 대화방 기록: 회원이 AI와 나눈 갈등 정리 대화, 감정 정리 내용, 대화 방향 조언 등 모든 대화 기록은 탈퇴 완료 시 즉시 파기됩니다. 삭제된 대화 기록은 복구할 수 없습니다. 단, 1:1 조정 사건에서 상대방과 함께 진행된 내용은 상대방의 계정 정보 처리 방침에 따라 별도 처리될 수 있습니다.',
      '2. 판결 기록: 회원이 참여한 단독 판결 및 1:1 판결에 관련된 모든 기록은 탈퇴 시 회원의 식별 정보와 분리되어 비식별 처리됩니다. 비식별화된 판결 통계 데이터는 서비스 품질 개선을 위해 활용될 수 있으나, 특정 개인을 식별할 수 없는 형태로만 사용됩니다. AI 판결 점수, 핵심 쟁점 요약, 판결 근거, 화해 제안, 화해 메시지 등 판결 관련 상세 데이터는 탈퇴와 동시에 파기됩니다.',
      '3. 감정일기: 회원이 작성한 모든 감정일기 내용은 탈퇴 완료와 동시에 영구 삭제됩니다. 감정일기는 서비스 외부에 공개되거나 공유된 적이 없으므로, 서비스 내 데이터 삭제 후 외부 유출 가능성이 없습니다.',
      '4. 달력 데이터: 달력에 기록된 감정 이모지, 월별 기록 등 달력 관련 데이터는 탈퇴 완료 시 삭제됩니다.',
      '5. 결과 카드 이미지: 판결 결과를 기반으로 생성된 결과 카드 이미지는 탈퇴 후 서비스 Storage에서 삭제됩니다. 단, 사용자가 이미 외부 SNS나 메신저 등을 통해 공유한 이미지에 대해서는 서비스에서 통제할 수 없습니다.',
      '6. 사건기록: 회원의 사건기록 페이지에 저장된 모든 AI 대화방 목록 및 사건 내역은 탈퇴 완료 시 삭제됩니다.',
    ],
  },
  {
    title: '제4조 (탈퇴 후 재가입 및 이용 제한)',
    paragraphs: [
      '1. 재가입 가능 여부: 탈퇴 완료 후에도 동일한 카카오 계정을 통해 말해부엉 서비스에 다시 가입하는 것은 가능합니다. 단, 탈퇴 이전의 모든 서비스 이용 데이터(대화 기록, 판결 내역, 감정일기, 사건기록 등)는 복구되지 않으며, 재가입 시에는 신규 회원으로서 처음부터 서비스를 이용하실 수 있습니다.',
      '2. 진행 중인 사건 처리: 탈퇴 신청 시점에 진행 중인 사건이 존재하는 경우, 해당 사건은 탈퇴와 함께 자동으로 종료 처리됩니다. 1:1 조정 사건이 진행 중인 경우 상대방에게 사건이 종료되었음이 안내되며, 이로 인해 상대방에게 불편이 발생할 수 있습니다. 진행 중인 사건이 있는 경우 탈퇴 전 해당 사건을 마무리하거나 상대방에게 사전 안내를 드리시기를 권고합니다.',
      '3. 초대 링크 무효화: 탈퇴 완료 시 해당 계정에서 발급된 모든 초대 링크가 즉시 무효화됩니다. 무효화된 초대 링크를 통해 접속을 시도하는 경우 참여가 차단됩니다.',
      '4. 부정 이용 방지: 서비스의 건전한 이용 환경 유지를 위해, 탈퇴 후 일정 기간 동안 동일 계정으로의 재가입 또는 서비스 이용에 일부 제한이 적용될 수 있습니다. 이는 서비스 악용 방지를 위한 최소한의 조치입니다.',
      '5. 카카오 연동 해제: 말해부엉 서비스 탈퇴는 카카오 계정 자체의 탈퇴나 삭제를 의미하지 않습니다. 탈퇴 완료 시 말해부엉 앱의 카카오 계정 연동 권한이 자동으로 해제됩니다. 카카오 계정을 완전히 삭제하거나 카카오 연동 앱을 관리하려면 카카오 계정 설정을 통해 별도로 처리하시기 바랍니다.',
    ],
  },
  {
    title: '제5조 (탈퇴 전 필수 확인사항)',
    paragraphs: [
      '탈퇴를 진행하기 전에 아래 사항을 반드시 확인하시기 바랍니다. 탈퇴 완료 이후에는 되돌릴 수 없으며, 아래의 모든 항목은 복구가 불가능합니다.',
      '1. AI 대화 기록 영구 삭제: AI와 함께 정리한 갈등 상황, 감정 정리 내용, 대화 방향 조언 등 모든 AI 대화 기록이 영구적으로 삭제됩니다. 소중한 대화 내역이 있다면 탈퇴 전에 별도로 기록해 두시기 바랍니다.',
      '2. 판결 결과 영구 삭제: 단독 판결 및 1:1 판결에서 받은 AI 판결 결과 전체가 삭제됩니다. AI 판결 점수, 핵심 쟁점 요약, 판결 근거, 화해 제안, 화해 메시지 등 모든 판결 관련 상세 데이터를 더 이상 조회할 수 없게 됩니다.',
      '3. 감정일기 전체 삭제: 서비스를 이용하면서 기록한 모든 날짜의 감정일기 내용이 영구적으로 삭제됩니다. 소중한 기록이 있다면 반드시 탈퇴 전 별도로 저장해 두시기 바랍니다.',
      '4. 진행 중인 사건 자동 종료: 현재 진행 중인 AI 대화방 또는 1:1 조정 사건이 있는 경우, 탈퇴와 함께 모든 사건이 자동으로 종료됩니다. 상대방이 참여 중인 사건이 있다면 상대방에게 불편을 드릴 수 있으므로, 진행 중인 사건이 없는지 반드시 미리 확인하시기 바랍니다.',
      '5. 달력 및 사건기록 삭제: 달력에 기록된 감정 이모지와 월별 감정 데이터, 사건기록에 저장된 모든 사건 내역이 영구 삭제됩니다. 탈퇴 후에는 어떠한 방법으로도 해당 데이터를 복구할 수 없습니다.',
      "탈퇴를 결정하셨다면 아래 '탈퇴하기' 버튼을 눌러 최종 확인 절차를 진행해 주세요. 탈퇴 확인 후에는 서비스 이용이 즉시 종료되며, 로그인 화면으로 이동합니다.",
    ],
  },
];

export default function WithdrawPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  useEffect(() => {
    setHeader({ variant: 'title', title: '회원탈퇴', onBack: () => router.back() });
    return () => setHeader(null);
  }, []);
  const { data: user } = useUserMe();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayName = user?.name ?? user?.nickname ?? '';

  const handleWithdraw = async () => {
    if (loading) return;
    setLoading(true);
    setConfirmOpen(false);
    try {
      const res = await fetch('/api/user/me', { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message = json?.error?.message ?? '탈퇴 처리 중 오류가 발생했습니다.';
        alert(message);
        return;
      }
      await signOut({ callbackUrl: '/login' });
    } catch {
      alert('탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className={styles.main}>
        <section className={styles.profile}>
          <Avatar size="l" src={user?.profileImageUrl ?? undefined} />
          <div className={styles.profile__info}>
            <span className={styles.profile__name}>{displayName}</span>
            <span className={styles.profile__email}>{user?.email ?? ''}</span>
          </div>
        </section>
        <div className={styles.terms}>
          {WITHDRAW_TERMS.map((section) => (
            <section key={section.title} className={styles.section}>
              <h2 className={styles.section__title}>{section.title}</h2>
              <div className={styles.section__body}>
                {section.paragraphs.map((para, idx) => (
                  <p key={idx} className={styles.section__paragraph}>
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <div className={styles.footer}>
        <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={loading}>
          탈퇴하기
        </Button>
      </div>
      <ConfirmModal
        open={confirmOpen}
        message="정말 탈퇴 하시겠어요?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleWithdraw}
      />
    </>
  );
}
