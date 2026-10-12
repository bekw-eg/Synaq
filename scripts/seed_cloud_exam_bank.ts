import { PrismaClient } from "@prisma/client";
import { seedSkills } from "../prisma/skillSeed";
import { seedExamBank } from "../prisma/examSeed";
import { VERIFIED_EXERCISES } from "../lib/exam/generated-bank";

async function main() {
  const connection = process.env.DATABASE_URL_UNPOOLED;
  if (!connection || connection === "[SENSITIVE]") throw new Error("A direct cloud database connection is required");
  const target = new URL(connection);
  if (!target.hostname.endsWith(".neon.tech") || target.hostname.includes("-pooler")) {
    throw new Error("Cloud initialization requires a direct Neon connection");
  }
  target.searchParams.set("connect_timeout", "30");
  const prisma = new PrismaClient({ datasources: { db: { url: target.toString() } } });
  try {
    // Only the seed fixture may exist while resuming a first-time import.
    const [realUsers, exams, attempts, topics] = await Promise.all([
      prisma.user.count({ where: { NOT: { id: "cluser0000000000000000001", email: "student@example.com" } } }),
      prisma.examSession.count(),
      prisma.userAttempt.count(),
      prisma.topic.count(),
    ]);
    if (realUsers || exams || attempts) throw new Error("First-time cloud initialization requires no user activity");
    if (topics < 15) throw new Error("Create the schema and base topics before importing the exam bank");
    if (process.argv.includes("--check")) {
      console.log("Cloud initialization preflight passed: schema and base topics present, no user activity.");
      return;
    }
    await seedSkills(prisma);
    await seedExamBank(prisma);
    const verifiedQuestions = await prisma.question.count({ where: { id: { in: VERIFIED_EXERCISES.map(q => q.id) } } });
    if (verifiedQuestions !== VERIFIED_EXERCISES.length) throw new Error("Verified exam bank import is incomplete");
    console.log(`Cloud exam bank ready: ${verifiedQuestions} verified questions.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  // Connection strings and user data must never appear in build logs.
  const message = error instanceof Error ? error.message : "Cloud initialization failed";
  console.error(message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED]"));
  process.exitCode = 1;
});
