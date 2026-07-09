import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const createNewConversation = async (
  studentId: number,
  title: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!user) {
    return {
      error: "User does not exist.",
    };
  }

  const newConversation = await prisma.conversation.create({
    data: {
      studentId: studentId,
      title: title,
    },
  });

  return {
    conversation: newConversation.id,
  };
};
