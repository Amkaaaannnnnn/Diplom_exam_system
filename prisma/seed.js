const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding the database...")

  // Create default admin user
  const hashedPassword = await bcrypt.hash("Password1!", 10)
  const admin = await prisma.user.upsert({
    where: { username: "ADM001" },
    update: {},
    create: {
      username: "ADM001",
      password: hashedPassword,
      name: "Админ хэрэглэгч",
      email: "admin@example.com",
      register: null,
      role: "admin",
      className: null,
      subject: null,
      status: "ACTIVE",
    },
  })

  console.log("Created default admin user:", admin)

  // Create default teacher users
  const teacher1 = await prisma.user.upsert({
    where: { username: "TCH0001" },
    update: {},
    create: {
      username: "TCH0001",
      password: hashedPassword,
      name: "Багш 1",
      email: "teacher1@example.com",
      register: null,
      role: "teacher",
      className: null,
      subject: "Математик",
      status: "ACTIVE",
    },
  })

  console.log("Created teacher 1:", teacher1)

  const teacher2 = await prisma.user.upsert({
    where: { username: "TCH0002" },
    update: {},
    create: {
      username: "TCH0002",
      password: hashedPassword,
      name: "Багш 2",
      email: "teacher2@example.com",
      register: null,
      role: "teacher",
      className: null,
      subject: "Физик",
      status: "ACTIVE",
    },
  })

  console.log("Created teacher 2:", teacher2)

  const teacher3 = await prisma.user.upsert({
    where: { username: "TCH0003" },
    update: {},
    create: {
      username: "TCH0003",
      password: hashedPassword,
      name: "Багш 3",
      email: "teacher3@example.com",
      register: null,
      role: "teacher",
      className: null,
      subject: "Англи хэл",
      status: "ACTIVE",
    },
  })

  console.log("Created teacher 3:", teacher3)

  // Create default student users
  const student1 = await prisma.user.upsert({
    where: { username: "STU0001" },
    update: {},
    create: {
      username: "ST0001",
      password: hashedPassword,
      name: "Сурагч 1",
      email: "student1@example.com",
      register: "АБ12345678",
      role: "student",
      className: "10а",
      subject: null,
      status: "ACTIVE",
    },
  })

  console.log("Created student 1:", student1)

  const student2 = await prisma.user.upsert({
    where: { username: "STU0002" },
    update: {},
    create: {
      username: "STS0002",
      password: hashedPassword,
      name: "Сурагч 2",
      email: "student2@example.com",
      register: "АБ23456789",
      role: "student",
      className: "10а",
      subject: null,
      status: "ACTIVE",
    },
  })

  console.log("Created student 2:", student2)

  // Create default subjects
  const math = await prisma.subject.upsert({
    where: { name: "Математик" },
    update: {},
    create: { name: "Математик" },
  })

  console.log("Created default subject:", math)

  const physics = await prisma.subject.upsert({
    where: { name: "Физик" },
    update: {},
    create: { name: "Физик" },
  })

  console.log("Created default subject:", physics)

  const chemistry = await prisma.subject.upsert({
    where: { name: "Хими" },
    update: {},
    create: { name: "Хими" },
  })

  console.log("Created default subject:", chemistry)

  const biology = await prisma.subject.upsert({
    where: { name: "Биологи" },
    update: {},
    create: { name: "Биологи" },
  })

  console.log("Created default subject:", biology)

  const english = await prisma.subject.upsert({
    where: { name: "Англи хэл" },
    update: {},
    create: { name: "Англи хэл" },
  })

  console.log("Created default subject:", english)

  // Create sample exams
  const mathExam = await prisma.exam.create({
    data: {
      title: "Математик улирлын шалгалт",
      description: "2-р улирлын шалгалт",
      subject: "Математик",
      userId: teacher1.id,
    },
  })

  console.log("Created math exam:", mathExam.title)

  const physicsExam = await prisma.exam.create({
    data: {
      title: "Физик улирлын шалгалт",
      description: "1-р улирлын шалгалт",
      subject: "Физик",
      userId: teacher2.id,
    },
  })

  console.log("Created physics exam:", physicsExam.title)

  const englishExam = await prisma.exam.create({
    data: {
      title: "Англи хэл улирлын шалгалт",
      description: "Grammar test",
      subject: "Англи хэл",
      userId: teacher3.id,
    },
  })

  console.log("Created English exam:", englishExam.title)

  // Create sample results
  const mathResult = await prisma.result.create({
    data: {
      score: 17,
      userId: student1.id,
      examId: mathExam.id,
    },
  })

  console.log("Created math result for student 1:", mathResult)

  const physicsResult = await prisma.result.create({
    data: {
      score: 60,
      userId: student1.id,
      examId: physicsExam.id,
    },
  })

  console.log("Created physics result for student 1:", physicsResult)

  console.log("Database seeding completed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
