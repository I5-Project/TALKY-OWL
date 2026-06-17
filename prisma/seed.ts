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
  // CONFLICT GROUP
  // ==================================================
  const groups = await Promise.all([
    prisma.conflictTypeGroup.create({
      data: {
        groupCode: "COMMUNICATION",
        displayName: "소통 갈등",
        sortOrder: 1,
      },
    }),
    prisma.conflictTypeGroup.create({
      data: {
        groupCode: "TRUST",
        displayName: "신뢰 갈등",
        sortOrder: 2,
      },
    }),
    prisma.conflictTypeGroup.create({
      data: {
        groupCode: "BOUNDARY",
        displayName: "경계 갈등",
        sortOrder: 3,
      },
    }),
  ]);

  // ==================================================
  // CONFLICT DETAIL
  // ==================================================
  const details = await Promise.all([
    prisma.conflictTypeDetail.create({
      data: {
        groupId: groups[0].id,
        detailCode: "NO_LISTEN",
        displayName: "대화 단절",
        sortOrder: 1,
      },
    }),
    prisma.conflictTypeDetail.create({
      data: {
        groupId: groups[1].id,
        detailCode: "BROKEN_TRUST",
        displayName: "신뢰 훼손",
        sortOrder: 2,
      },
    }),
    prisma.conflictTypeDetail.create({
      data: {
        groupId: groups[2].id,
        detailCode: "OVER_INTERFERENCE",
        displayName: "과도한 간섭",
        sortOrder: 3,
      },
    }),
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
      reasoning: "상호 소통 부족",
      advice: "기대치를 공유하세요",
      resultConflictGroupId: groups[0].id,
      resultConflictDetailId: details[0].id,
      resultCardId: card.id,
      aiNoticeId: notices[0].id,
      modelName: "gpt-5.5",
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