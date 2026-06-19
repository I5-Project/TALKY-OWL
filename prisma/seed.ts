import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // ==================================================
  // USERS
  // ==================================================
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "user1@test.com",
        nickname: "부엉이1",
        gender: "MALE",
        ageGroup: "TWENTIES",
        mbti: "INTJ",
      },
    }),
    prisma.user.create({
      data: {
        email: "user2@test.com",
        nickname: "부엉이2",
        gender: "FEMALE",
        ageGroup: "THIRTIES",
        mbti: "ENFP",
      },
    }),
    prisma.user.create({
      data: {
        email: "user3@test.com",
        nickname: "부엉이3",
        gender: "OTHER",
        ageGroup: "TWENTIES",
        mbti: "INFP",
      },
    }),
  ]);

  // ==================================================
  // CONFLICT TYPE GROUP
  // ==================================================
  const groups = await Promise.all([
    prisma.conflictTypeGroup.create({
      data: { groupCode: "communication", displayName: "소통 갈등", sortOrder: 1 },
    }),
    prisma.conflictTypeGroup.create({
      data: { groupCode: "value", displayName: "가치관 갈등", sortOrder: 2 },
    }),
    prisma.conflictTypeGroup.create({
      data: { groupCode: "lifestyle", displayName: "생활 갈등", sortOrder: 3 },
    }),
    prisma.conflictTypeGroup.create({
      data: { groupCode: "financial", displayName: "금전 갈등", sortOrder: 4 },
    }),
  ]);

  // ==================================================
  // CONFLICT DETAIL
  // ==================================================
  const details = await Promise.all([
    prisma.conflictTypeDetail.create({ data: { groupId: groups[0].id, detailCode: "value_difference",           displayName: "가치관 차이형",    sortOrder: 1 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[0].id, detailCode: "emotional_invalidation",     displayName: "감정 미인정형",    sortOrder: 2 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[2].id, detailCode: "space_occupation",           displayName: "공간점유형",       sortOrder: 3 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[1].id, detailCode: "fairness_perception",        displayName: "공정성인식형",     sortOrder: 4 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[3].id, detailCode: "money_borrowing",            displayName: "금전차용형",       sortOrder: 5 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[1].id, detailCode: "expectation_mismatch",       displayName: "기대 불일치형",    sortOrder: 6 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[3].id, detailCode: "split_bill_conflict",        displayName: "더치페이갈등형",   sortOrder: 7 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[2].id, detailCode: "lifestyle_noise_conflict",   displayName: "소음생활패턴형",   sortOrder: 8 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[0].id, detailCode: "communication_breakdown",    displayName: "소통단절형",       sortOrder: 9 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[2].id, detailCode: "punctuality_issue",          displayName: "시간약속형",       sortOrder: 10 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[2].id, detailCode: "role_distribution_conflict", displayName: "역할분담형",       sortOrder: 11 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[1].id, detailCode: "priority_conflict",          displayName: "우선순위충돌형",   sortOrder: 12 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[1].id, detailCode: "decision_conflict",          displayName: "의사결정충돌형",   sortOrder: 13 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[0].id, detailCode: "jealousy_comparison",        displayName: "질투비교형",       sortOrder: 14 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[0].id, detailCode: "responsibility_avoidance",   displayName: "책임회피형",       sortOrder: 15 } }),
    prisma.conflictTypeDetail.create({ data: { groupId: groups[0].id, detailCode: "expression_style_difference",displayName: "표현방식차이형",  sortOrder: 16 } }),
  ]);

  // ==================================================
  // AI NOTICE
  // ==================================================
  const notices = await Promise.all([
    prisma.aiResultNotice.create({
      data: {
        noticeType: "DEFAULT",
        title: "AI 판결 안내",
        content: "AI가 생성한 결과입니다.",
        version: "1.0.0",
      },
    }),
    prisma.aiResultNotice.create({
      data: {
        noticeType: "DEFAULT2",
        title: "AI 판결 안내2",
        content: "참고용 결과입니다.",
        version: "1.0.1",
      },
    }),
    prisma.aiResultNotice.create({
      data: {
        noticeType: "DEFAULT3",
        title: "AI 판결 안내3",
        content: "법적 효력이 없습니다.",
        version: "1.0.2",
      },
    }),
  ]);

  // ==================================================
  // ROOM
  // ==================================================
  const rooms = await Promise.all([
    prisma.disputeRoom.create({
      data: {
        roomNo: "ROOM-001",
        creatorUserId: users[0].id,
        categoryGroup: "ROMANCE",
      },
    }),
    prisma.disputeRoom.create({
      data: {
        roomNo: "ROOM-002",
        creatorUserId: users[1].id,
        categoryGroup: "FAMILY",
      },
    }),
    prisma.disputeRoom.create({
      data: {
        roomNo: "ROOM-003",
        creatorUserId: users[2].id,
        categoryGroup: "WORK",
      },
    }),
  ]);

  // ==================================================
  // AI CONVERSATION
  // ==================================================
  const conversations = await Promise.all([
    prisma.roomAiConversation.create({
      data: {
        roomId: rooms[0].id,
        userId: users[0].id,
        categoryGroup: "ROMANCE",
        title: "연인 갈등",
      },
    }),
    prisma.roomAiConversation.create({
      data: {
        roomId: rooms[1].id,
        userId: users[1].id,
        categoryGroup: "FAMILY",
        title: "가족 갈등",
      },
    }),
    prisma.roomAiConversation.create({
      data: {
        roomId: rooms[2].id,
        userId: users[2].id,
        categoryGroup: "WORK",
        title: "직장 갈등",
      },
    }),
  ]);

  // ==================================================
  // MESSAGES
  // ==================================================
  await prisma.roomAiMessage.createMany({
    data: [
      {
        roomId: rooms[0].id,
        conversationId: conversations[0].id,
        userId: users[0].id,
        senderType: "USER",
        content: "남자친구가 연락을 안 해요.",
        messageOrder: 1,
      },
      {
        roomId: rooms[1].id,
        conversationId: conversations[1].id,
        userId: users[1].id,
        senderType: "USER",
        content: "부모님과 의견 충돌이 있어요.",
        messageOrder: 1,
      },
      {
        roomId: rooms[2].id,
        conversationId: conversations[2].id,
        userId: users[2].id,
        senderType: "USER",
        content: "상사와 마찰이 있습니다.",
        messageOrder: 1,
      },
    ],
  });

  // ==================================================
  // DISPUTE
  // ==================================================
  const disputes = await Promise.all([
    prisma.dispute.create({
      data: {
        roomId: rooms[0].id,
        sourceConversationId: conversations[0].id,
        categoryGroup: "ROMANCE",
        title: "연락 문제",
      },
    }),
    prisma.dispute.create({
      data: {
        roomId: rooms[1].id,
        sourceConversationId: conversations[1].id,
        categoryGroup: "FAMILY",
        title: "진로 문제",
      },
    }),
    prisma.dispute.create({
      data: {
        roomId: rooms[2].id,
        sourceConversationId: conversations[2].id,
        categoryGroup: "WORK",
        title: "업무 분배 문제",
      },
    }),
  ]);

  // ==================================================
  // PARTICIPANTS
  // ==================================================
  const participantA = await prisma.disputeParticipant.create({
    data: {
      disputeId: disputes[0].id,
      userId: users[0].id,
      role: "ROLE_A",
    },
  });

  const participantB = await prisma.disputeParticipant.create({
    data: {
      disputeId: disputes[0].id,
      userId: users[1].id,
      role: "ROLE_B",
    },
  });

  // ==================================================
  // STATEMENTS
  // ==================================================
  await prisma.disputeStatement.createMany({
    data: [
      {
        disputeId: disputes[0].id,
        participantId: participantA.id,
        userId: users[0].id,
        role: "ROLE_A",
        content: "상대가 연락을 자주 안 합니다.",
      },
      {
        disputeId: disputes[0].id,
        participantId: participantB.id,
        userId: users[1].id,
        role: "ROLE_B",
        content: "업무 때문에 바빴습니다.",
      },
    ],
  });

  // ==================================================
  // RESULT CARD
  // ==================================================
  const card = await prisma.judgmentResultCard.create({
    data: {
      cardTitle: "소통이 필요한 부엉이",
      cardSummary: "대화가 부족한 상태",
    },
  });

  // ==================================================
  // AI JUDGMENT
  // ==================================================
  const judgment = await prisma.aiJudgment.create({
    data: {
      disputeId: disputes[0].id,
      verdictScoreA: 45,
      verdictScoreB: 55,
      moreResponsibleRole: "ROLE_B",
      issueSummary: "연락 빈도 차이",
      aFault: "연락 빈도에 대한 기대치를 먼저 공유하지 않은 점",
      bFault: "상대방의 소통 요구를 충분히 수용하지 않은 점",
      aSuggestedLine: "앞으로 서로 기대하는 연락 주기를 함께 정해보면 어떨까요?",
      bSuggestedLine: "내가 바빴더라도 짧게라도 먼저 연락할게요.",
      resultConflictGroupId: groups[0].id,
      resultConflictDetailId: details[0].id,
      resultCardId: card.id,
      aiNoticeId: notices[0].id,
      modelName: "gemini-2.5-flash",
    },
  });

  // ==================================================
  // GIFT
  // ==================================================
  const gift = await prisma.giftRecommendation.create({
    data: {
      judgmentId: judgment.id,
      disputeId: disputes[0].id,
      giftSenderUserId: users[0].id,
      giftReceiverUserId: users[1].id,
      senderRole: "ROLE_A",
      receiverRole: "ROLE_B",
      recommendationReason: "화해 선물",
    },
  });

  await prisma.giftRecommendationItem.createMany({
    data: [
      {
        recommendationId: gift.id,
        itemName: "꽃다발",
      },
      {
        recommendationId: gift.id,
        itemName: "향초",
      },
      {
        recommendationId: gift.id,
        itemName: "손편지",
      },
    ],
  });

  console.log("✅ Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });