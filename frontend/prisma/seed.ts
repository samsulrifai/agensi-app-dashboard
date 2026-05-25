import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

// Load .env.local untuk seed script
config({ path: ".env.local" });
config({ path: ".env" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean up ──────────────────────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.timeLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectWorker.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);

  // ─── Admins ────────────────────────────────────────────────────────────────
  const admin1 = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      passwordHash,
      fullName: "Admin Utama",
      role: "admin",
      avatarUrl: "https://i.pravatar.cc/150?u=admin",
      phone: "+6281234560001",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: "rina@demo.com",
      passwordHash,
      fullName: "Rina Manager",
      role: "admin",
      avatarUrl: "https://i.pravatar.cc/150?u=rina",
      phone: "+6281234560002",
    },
  });

  // ─── Workers ───────────────────────────────────────────────────────────────
  const andi = await prisma.user.create({
    data: {
      email: "andi@demo.com",
      passwordHash,
      fullName: "Andi Worker",
      role: "worker",
      avatarUrl: "https://i.pravatar.cc/150?u=andi",
      skills: ["React", "Next.js", "Node.js", "TypeScript"],
      phone: "+6281234560003",
    },
  });

  const budi = await prisma.user.create({
    data: {
      email: "budi@demo.com",
      passwordHash,
      fullName: "Budi Santoso",
      role: "worker",
      avatarUrl: "https://i.pravatar.cc/150?u=budi",
      skills: ["UI/UX", "Figma", "Framer"],
      phone: "+6281234560004",
    },
  });

  const citra = await prisma.user.create({
    data: {
      email: "citra@demo.com",
      passwordHash,
      fullName: "Citra Sari",
      role: "worker",
      skills: ["Copywriting", "SEO", "Content Marketing"],
      phone: "+6281234560005",
    },
  });

  const dian = await prisma.user.create({
    data: {
      email: "dian@demo.com",
      passwordHash,
      fullName: "Dian Pratama",
      role: "worker",
      skills: ["Python", "Data Analysis", "Machine Learning"],
      phone: "+6281234560006",
    },
  });

  const eko = await prisma.user.create({
    data: {
      email: "eko@demo.com",
      passwordHash,
      fullName: "Eko Saputra",
      role: "worker",
      skills: ["Laravel", "PHP", "MySQL"],
      phone: "+6281234560007",
    },
  });

  // ─── Projects ──────────────────────────────────────────────────────────────
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 86400000);
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

  // 1. In Progress - Urgent
  const project1 = await prisma.project.create({
    data: {
      title: "E-Commerce Redesign",
      description: "Redesain total platform e-commerce klien termasuk UI/UX baru, sistem cart, dan checkout flow.",
      clientName: "TechCorp Inc.",
      budget: 45000000,
      status: "in_progress",
      priority: "high",
      deadline: days(2),
      adminId: admin2.id,
    },
  });

  // 2. In Progress
  const project2 = await prisma.project.create({
    data: {
      title: "Mobile App Backend",
      description: "Pembangunan API backend untuk aplikasi mobile startup dengan fitur real-time.",
      clientName: "StartupX",
      budget: 60000000,
      status: "review",
      priority: "critical",
      deadline: days(14),
      adminId: admin1.id,
    },
  });

  // 3. In Progress
  const project3 = await prisma.project.create({
    data: {
      title: "Marketing Landing Page",
      description: "Landing page campaign produk baru dengan animasi dan konversi tinggi.",
      clientName: "Digital Agency",
      budget: 15000000,
      status: "in_progress",
      priority: "medium",
      deadline: days(30),
      adminId: admin2.id,
    },
  });

  // 4. Todo
  const project4 = await prisma.project.create({
    data: {
      title: "Branding Guidelines",
      description: "Pembuatan brand guide lengkap termasuk logo usage, color palette, typography.",
      clientName: "Creative Studio",
      budget: 20000000,
      status: "todo",
      priority: "medium",
      deadline: days(45),
      adminId: admin1.id,
    },
  });

  // 5. Todo
  const project5 = await prisma.project.create({
    data: {
      title: "SEO Copywriting Bundle",
      description: "Penulisan 20 artikel SEO untuk klien di industri teknologi.",
      clientName: "TechBlog Co.",
      budget: 10000000,
      status: "todo",
      priority: "low",
      deadline: days(60),
      adminId: admin2.id,
    },
  });

  // 6. Done
  const project6 = await prisma.project.create({
    data: {
      title: "Dashboard UI Kit",
      description: "Pembuatan UI kit komponen dashboard yang reusable untuk klien internal.",
      clientName: "Internal",
      budget: 25000000,
      status: "done",
      priority: "medium",
      deadline: daysAgo(25),
      completedAt: daysAgo(25),
      adminId: admin1.id,
    },
  });

  // 7. Done
  const project7 = await prisma.project.create({
    data: {
      title: "Logo Animation Package",
      description: "Animasi logo untuk 3 brand dalam satu package.",
      clientName: "AnimStudio",
      budget: 8000000,
      status: "done",
      priority: "low",
      deadline: daysAgo(60),
      completedAt: daysAgo(60),
      adminId: admin2.id,
    },
  });

  // 8. Archived
  const project8 = await prisma.project.create({
    data: {
      title: "Data Analytics Dashboard",
      description: "Dashboard visualisasi data penjualan untuk klien retail.",
      clientName: "RetailPro",
      budget: 35000000,
      status: "archived",
      priority: "high",
      deadline: daysAgo(90),
      completedAt: daysAgo(88),
      adminId: admin1.id,
    },
  });

  // ─── Project Workers ────────────────────────────────────────────────────────
  await prisma.projectWorker.createMany({
    data: [
      { projectId: project1.id, workerId: andi.id, roleInProject: "Frontend Developer" },
      { projectId: project1.id, workerId: budi.id, roleInProject: "UI/UX Designer" },
      { projectId: project2.id, workerId: andi.id, roleInProject: "Backend Developer" },
      { projectId: project3.id, workerId: citra.id, roleInProject: "Copywriter" },
      { projectId: project3.id, workerId: budi.id, roleInProject: "Designer" },
      { projectId: project4.id, workerId: budi.id, roleInProject: "Brand Designer" },
      { projectId: project5.id, workerId: citra.id, roleInProject: "Content Writer" },
      { projectId: project6.id, workerId: andi.id, roleInProject: "Frontend Developer" },
      { projectId: project6.id, workerId: budi.id, roleInProject: "UI Designer" },
      { projectId: project7.id, workerId: budi.id, roleInProject: "Motion Designer" },
      { projectId: project8.id, workerId: dian.id, roleInProject: "Data Analyst" },
      { projectId: project8.id, workerId: eko.id, roleInProject: "Backend Developer" },
    ],
  });

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  const tasks = await prisma.task.createMany({
    data: [
      // Project 1 - E-Commerce Redesign
      { projectId: project1.id, assignedTo: andi.id, title: "Design System Implementation", status: "in_progress", deadline: days(1), estimatedHours: 16 },
      { projectId: project1.id, assignedTo: andi.id, title: "Product Page Layout", status: "todo", deadline: days(2), estimatedHours: 8 },
      { projectId: project1.id, assignedTo: budi.id, title: "Checkout Flow UI", status: "done", deadline: daysAgo(5), estimatedHours: 12, actualHours: 11 },
      { projectId: project1.id, assignedTo: budi.id, title: "Mobile Responsive Design", status: "review", deadline: daysAgo(2), estimatedHours: 10 },
      // Project 2 - Mobile App Backend
      { projectId: project2.id, assignedTo: andi.id, title: "REST API Architecture", status: "done", deadline: daysAgo(10), estimatedHours: 20, actualHours: 22 },
      { projectId: project2.id, assignedTo: andi.id, title: "Authentication System", status: "done", deadline: daysAgo(7), estimatedHours: 12, actualHours: 10 },
      { projectId: project2.id, assignedTo: andi.id, title: "Push Notification Service", status: "in_progress", deadline: days(5), estimatedHours: 8 },
      // Project 3 - Marketing Landing Page
      { projectId: project3.id, assignedTo: citra.id, title: "Copywriting - Hero Section", status: "done", deadline: daysAgo(3), estimatedHours: 4, actualHours: 3 },
      { projectId: project3.id, assignedTo: budi.id, title: "Visual Design - Hero", status: "in_progress", deadline: days(7), estimatedHours: 8 },
      { projectId: project3.id, assignedTo: citra.id, title: "Copywriting - Features Section", status: "todo", deadline: days(10), estimatedHours: 4 },
      // Project 6 - Dashboard UI Kit (Done)
      { projectId: project6.id, assignedTo: andi.id, title: "Component Library Setup", status: "done", deadline: daysAgo(35), estimatedHours: 8, actualHours: 7 },
      { projectId: project6.id, assignedTo: budi.id, title: "UI Component Design", status: "done", deadline: daysAgo(30), estimatedHours: 20, actualHours: 18 },
    ],
  });

  // ─── Milestones ────────────────────────────────────────────────────────────
  await prisma.milestone.createMany({
    data: [
      { projectId: project1.id, title: "Design Phase Complete", dueDate: daysAgo(5), status: "completed", amount: 15000000 },
      { projectId: project1.id, title: "Development Phase Complete", dueDate: days(2), status: "pending", amount: 30000000 },
      { projectId: project2.id, title: "API v1 Complete", dueDate: daysAgo(7), status: "completed", amount: 25000000 },
      { projectId: project2.id, title: "Final Delivery", dueDate: days(14), status: "pending", amount: 35000000 },
    ],
  });

  // ─── Invoices ──────────────────────────────────────────────────────────────
  const inv1 = await prisma.invoice.create({
    data: {
      workerId: andi.id,
      projectId: project1.id,
      amount: 4500000,
      status: "pending",
      invoiceDate: new Date(),
      dueDate: days(14),
      notes: "Milestone 1: Design System Implementation selesai",
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      workerId: budi.id,
      projectId: project2.id,
      amount: 8000000,
      status: "pending",
      invoiceDate: daysAgo(1),
      dueDate: days(13),
      notes: "API Architecture dan Authentication selesai",
    },
  });

  const inv3 = await prisma.invoice.create({
    data: {
      workerId: citra.id,
      projectId: project5.id,
      amount: 2500000,
      status: "approved",
      invoiceDate: daysAgo(5),
      dueDate: days(9),
      notes: "SEO Articles batch 1",
      approvedBy: admin2.id,
      approvedAt: daysAgo(3),
    },
  });

  const inv4 = await prisma.invoice.create({
    data: {
      workerId: andi.id,
      projectId: project6.id,
      amount: 5500000,
      status: "paid",
      invoiceDate: daysAgo(30),
      dueDate: daysAgo(20),
      notes: "Dashboard UI Kit - selesai",
      approvedBy: admin1.id,
      approvedAt: daysAgo(25),
    },
  });

  const inv5 = await prisma.invoice.create({
    data: {
      workerId: budi.id,
      projectId: project7.id,
      amount: 1500000,
      status: "rejected",
      invoiceDate: daysAgo(65),
      dueDate: daysAgo(55),
      notes: "Logo Animation",
      rejectionReason: "Nominal melebihi budget yang telah disepakati. Mohon revisi.",
    },
  });

  // ─── Ratings ───────────────────────────────────────────────────────────────
  await prisma.rating.createMany({
    data: [
      {
        workerId: andi.id,
        adminId: admin1.id,
        projectId: project6.id,
        scoreDeadline: 5.0,
        scoreQuality: 5.0,
        scoreCommunication: 4.5,
        overallScore: 4.9,
        reviewText: "Excellent work! Delivered faster than expected and the code quality was top-notch. Highly recommended.",
      },
      {
        workerId: budi.id,
        adminId: admin2.id,
        projectId: project7.id,
        scoreDeadline: 4.0,
        scoreQuality: 4.0,
        scoreCommunication: 4.5,
        overallScore: 4.2,
        reviewText: "Good animation skills. Slightly delayed communication but overall a solid delivery.",
      },
      {
        workerId: dian.id,
        adminId: admin1.id,
        projectId: project8.id,
        scoreDeadline: 4.5,
        scoreQuality: 5.0,
        scoreCommunication: 4.5,
        overallScore: 4.7,
        reviewText: "Sangat detail dalam analisa data dan visualisasi. Komunikasi bagus.",
      },
    ],
  });

  // ─── Time Logs ─────────────────────────────────────────────────────────────
  const taskList = await prisma.task.findMany({ where: { projectId: { in: [project1.id, project2.id, project6.id] } } });
  const andiTasks = taskList.filter((t) => t.assignedTo === andi.id);

  for (const task of andiTasks.slice(0, 3)) {
    for (let i = 1; i <= 3; i++) {
      const started = daysAgo(i * 3);
      const ended = new Date(started.getTime() + 2 * 3600000);
      await prisma.timeLog.create({
        data: {
          taskId: task.id,
          workerId: andi.id,
          startedAt: started,
          endedAt: ended,
          durationMinutes: 120,
        },
      });
    }
  }

  // ─── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      // Worker notifications
      {
        userId: andi.id,
        type: "invoice_approved",
        title: "Invoice Disetujui",
        body: `Invoice Anda untuk proyek "Dashboard UI Kit" sebesar Rp 5.500.000 telah disetujui.`,
        isRead: true,
        createdAt: daysAgo(25),
      },
      {
        userId: andi.id,
        type: "project_assigned",
        title: "Proyek Baru Ditugaskan",
        body: `Anda telah ditugaskan ke proyek "Marketing Landing Page".`,
        isRead: true,
        createdAt: daysAgo(3),
      },
      {
        userId: andi.id,
        type: "rating_received",
        title: "Rating Baru Diterima",
        body: "Rina Manager memberikan rating 5 bintang untuk proyek Dashboard UI Kit.",
        isRead: false,
        createdAt: daysAgo(2),
      },
      {
        userId: andi.id,
        type: "deadline_reminder",
        title: "Deadline Mendekat!",
        body: `Proyek "E-Commerce Redesign" akan berakhir dalam 2 hari.`,
        isRead: false,
        createdAt: daysAgo(1),
      },
      // Admin notifications
      {
        userId: admin2.id,
        type: "invoice_submitted",
        title: "Invoice Baru dari Andi Worker",
        body: `Invoice sebesar Rp 4.500.000 untuk proyek "E-Commerce Redesign" menunggu review.`,
        isRead: false,
        createdAt: new Date(),
      },
      {
        userId: admin1.id,
        type: "invoice_submitted",
        title: "Invoice Baru dari Budi Santoso",
        body: `Invoice sebesar Rp 8.000.000 untuk proyek "Mobile App Backend" menunggu review.`,
        isRead: false,
        createdAt: daysAgo(1),
      },
      {
        userId: budi.id,
        type: "invoice_rejected",
        title: "Invoice Ditolak",
        body: `Invoice Anda untuk proyek "Logo Animation Package" ditolak. Alasan: Nominal melebihi budget.`,
        isRead: true,
        createdAt: daysAgo(60),
      },
      {
        userId: citra.id,
        type: "invoice_approved",
        title: "Invoice Disetujui",
        body: `Invoice Anda untuk proyek "SEO Copywriting Bundle" sebesar Rp 2.500.000 telah disetujui.`,
        isRead: false,
        createdAt: daysAgo(3),
      },
    ],
  });

  console.log("✅ Seed selesai!");
  console.log("📋 Demo accounts:");
  console.log("   Admin: admin@demo.com / demo1234");
  console.log("   Admin: rina@demo.com / demo1234");
  console.log("   Worker: andi@demo.com / demo1234");
  console.log("   Worker: budi@demo.com / demo1234");
  console.log("   Worker: citra@demo.com / demo1234");
  console.log("   Worker: dian@demo.com / demo1234");
  console.log("   Worker: eko@demo.com / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
