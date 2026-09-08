import { createTask, getLatestTask, listActiveTasks, updateProgress, blockTask, completeTask } from "../tasks/task.service.js";
import { helpText } from "./whatsapp.service.js";

function parseCommand(text: string) {
  const trimmed = text.trim();
  const [command, ...rest] = trimmed.split(/\s+/);
  return { command: (command ?? "").toLowerCase(), args: rest.join(" ").trim() };
}

function formatTask(task: { title: string; status: string; progress: number; deadline: Date | null }) {
  const status = ({ TODO: "⚪ TODO", WORKING: "🔵 WORKING", BLOCKED: "🔴 BLOCKED", DONE: "🟢 DONE", CANCELLED: "⚫ CANCELLED" } as Record<string, string>)[task.status] ?? task.status;
  const deadline = task.deadline ? `\nDeadline: ${task.deadline.toLocaleDateString("id-ID")}` : "";
  return `📝 ${task.title}\nStatus: ${status}\nProgress: ${task.progress}%${deadline}`;
}

export async function handleCommand(userId: string, text: string): Promise<string> {
  const { command, args } = parseCommand(text);

  if (!command || command === "help" || command === "menu") return helpText();

  if (command === "task") {
    if (!args) return "Format: task Nama task\nContoh: task Payment API";
    const task = await createTask(userId, args);
    return `✅ Task dibuat.\n\n${formatTask(task)}`;
  }

  if (command === "tasks") {
    const tasks = await listActiveTasks(userId);
    if (tasks.length === 0) return "📭 Belum ada task aktif.";
    return ["📋 *Task aktif*", "", ...tasks.map((task, i) => `${i + 1}. ${formatTask(task)}`)].join("\n\n");
  }

  if (command === "status") {
    const task = await getLatestTask(userId);
    return task ? `📊 *Task terakhir*\n\n${formatTask(task)}` : "📭 Belum ada task aktif.";
  }

  if (command === "progress") {
    const [value, ...noteParts] = args.split(/\s+/);
    const progress = Number(value);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) return "Format: progress 0-100 [catatan]\nContoh: progress 70 API hampir selesai";
    const task = await getLatestTask(userId);
    if (!task) return "📭 Tidak ada task aktif.";
    try {
      const updated = await updateProgress(userId, task.id, progress, noteParts.join(" ") || undefined);
      return `🔄 Progress diperbarui.\n\n${formatTask(updated)}`;
    } catch (error) {
      if (error instanceof Error && error.message === "TASK_CLOSED") return "Task tersebut sudah ditutup.";
      throw error;
    }
  }

  if (command === "block") {
    if (!args) return "Format: block Alasan\nContoh: block Menunggu API dari client";
    const task = await getLatestTask(userId);
    if (!task) return "📭 Tidak ada task aktif.";
    const updated = await blockTask(userId, task.id, args);
    return `🚧 Task diblokir.\n\n${formatTask(updated)}\n\nAlasan: ${args}`;
  }

  if (command === "done") {
    const task = await getLatestTask(userId);
    if (!task) return "📭 Tidak ada task aktif.";
    const updated = await completeTask(userId, task.id);
    return `✅ Task selesai!\n\n${formatTask(updated)}`;
  }

  return `Saya belum mengenali perintah *${command}*.\n\n${helpText()}`;
}
