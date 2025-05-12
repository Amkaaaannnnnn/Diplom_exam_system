import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth-server"

// Add this function at the beginning of the file, right after the imports:
function normalizeClassName(className) {
  // Remove any non-numeric characters from class names
  if (typeof className === "string") {
    return className.replace(/[^0-9]/g, "")
  }
  return className
}

// Create a new exam
export async function POST(req) {
  try {
    // Check if the current user is an admin or teacher
    const currentUser = await getServerUser()
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, subject, className, duration, totalPoints, examDate, examTime, questions } = body

    // Validate required fields
    if (!title || !subject || !className) {
      return NextResponse.json({ error: "Шаардлагатай талбарууд дутуу байна" }, { status: 400 })
    }

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Шалгалтад дор хаяж нэг даалгавар оруулах шаардлагатай" }, { status: 400 })
    }

    console.log("Creating exam with data:", { title, subject, className, questions: questions?.length || 0 })

    // Find students in the selected class
    const studentsInClass = await prisma.user.findMany({
      where: {
        role: "student",
        className: className,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    })

    console.log(`Found ${studentsInClass.length} students in class ${className}`)

    // Create the exam with questions in a transaction
    const exam = await prisma.$transaction(async (tx) => {
      // Create the exam
      const newExam = await tx.exam.create({
        data: {
          title,
          description,
          subject,
          className: normalizeClassName(className), // Normalize class name
          duration: duration ? Number.parseInt(duration) : 30,
          totalPoints: totalPoints ? Number.parseInt(totalPoints) : 100,
          examDate: examDate ? new Date(examDate) : null,
          examTime,
          userId: currentUser.id,
        },
      })

      console.log("Created exam:", newExam.id)

      // Create questions if provided
      if (questions && questions.length > 0) {
        for (const q of questions) {
          try {
            // Create the question first
            const newQuestion = await tx.question.create({
              data: {
                text: q.text,
                type: q.type,
                points: q.points || 1,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                className: normalizeClassName(q.className || className), // Normalize class name
                category: q.category || "",
                difficulty: q.difficulty || null,
                userId: currentUser.id,
                isInBank: true,
              },
            })

            // Then create the relationship between exam and question using ExamQuestion
            await tx.examQuestion.create({
              data: {
                examId: newExam.id,
                questionId: newQuestion.id,
              },
            })
          } catch (error) {
            console.error("Даалгавар үүсгэхэд алдаа гарлаа:", error)
            throw new Error(`Даалгавар үүсгэхэд алдаа гарлаа: ${error.message}`)
          }
        }
        console.log(`Added ${questions.length} questions to exam`)
      }

      // Assign exam to all students in the class
      if (studentsInClass.length > 0) {
        try {
          const examAssignments = studentsInClass.map((student) => ({
            examId: newExam.id,
            userId: student.id,
            status: "PENDING",
          }))

          await tx.examAssignment.createMany({
            data: examAssignments,
          })

          console.log(`Assigned exam to ${studentsInClass.length} students`)
        } catch (error) {
          console.error("Шалгалтыг сурагчдад оноох үед алдаа гарлаа:", error)
          throw new Error(`Шалгалтыг сурагчдад оноох үед алдаа гарлаа: ${error.message}`)
        }
      }

      return newExam
    })

    // Fetch the complete exam with questions
    const completeExam = await prisma.exam.findUnique({
      where: { id: exam.id },
      include: {
        examQuestions: {
          include: {
            question: true,
          },
        },
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(completeExam, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json(
      {
        error: "Шалгалт үүсгэх үед алдаа гарлаа",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Get all exams
export async function GET(req) {
  try {
    // Check if the current user is authenticated
    const currentUser = await getServerUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    console.log("Fetching exams for user:", currentUser.id, currentUser.role)

    // Get exams based on role
    let exams
    if (currentUser.role === "admin") {
      // Admin can see all exams
      exams = await prisma.exam.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
          examQuestions: {
            include: {
              question: true,
            },
          },
          assignedTo: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else if (currentUser.role === "teacher") {
      // Teachers can see their own exams
      exams = await prisma.exam.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
          examQuestions: {
            include: {
              question: true,
            },
          },
          assignedTo: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else {
      // Students can see exams assigned to them
      exams = await prisma.exam.findMany({
        where: {
          assignedTo: {
            some: {
              userId: currentUser.id,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
          examQuestions: {
            include: {
              question: {
                select: {
                  id: true,
                  text: true,
                  type: true,
                  points: true,
                  options: true,
                  // Don't include correctAnswer for students
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    console.log(`Found ${exams.length} exams`)
    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ error: "Шалгалтуудыг татах үед алдаа гарлаа", details: error.message }, { status: 500 })
  }
}
