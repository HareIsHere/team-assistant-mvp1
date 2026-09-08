import { Prisma, TaskStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export async function createTask(userId: string, title: string, deadline?: Date) {
  return prisma.task.create({
    data: { userId, title, deadline, status: TaskStatus.WORKING }
  });
}

export async function listActiveTasks(userId: string) {
  return prisma.task.findMany({
    where: { userId, status: { in: [TaskStatus.TODO, TaskStatus.WORKING, TaskStatus.BLOCKED] } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getLatestTask(userId: string) {
  return prisma.task.findFirst({
    where: { userId, status: { in: [TaskStatus.TODO, TaskStatus.WORKING, TaskStatus.BLOCKED] } },
    orderBy: { updatedAt: "desc" }
  });
}

export async function updateProgress(userId: string, taskId: string, progress: number, note?: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("TASK_NOT_FOUND");
  if (task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED) throw new Error("TASK_CLOSED");

  const nextStatus = progress >= 100 ? TaskStatus.DONE : TaskStatus.WORKING;
  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const result = await tx.task.update({
      where: { id: task.id },
      data: {
        progress,
        status: nextStatus,
        completedAt: nextStatus === TaskStatus.DONE ? new Date() : null
      }
    });
    await tx.taskUpdate.create({
      data: {
        taskId: task.id,
        userId,
        oldStatus: task.status,
        newStatus: nextStatus,
        oldProgress: task.progress,
        newProgress: progress,
        note
      }
    });
    return result;
  });
  return updated;
}

export async function blockTask(userId: string, taskId: string, note?: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("TASK_NOT_FOUND");
  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const result = await tx.task.update({ where: { id: task.id }, data: { status: TaskStatus.BLOCKED } });
    await tx.taskUpdate.create({
      data: { taskId: task.id, userId, oldStatus: task.status, newStatus: TaskStatus.BLOCKED, oldProgress: task.progress, newProgress: task.progress, note }
    });
    return result;
  });
  return updated;
}

export async function completeTask(userId: string, taskId: string) {
  return updateProgress(userId, taskId, 100, "Completed by user");
}
