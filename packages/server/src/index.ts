import dotenv from "dotenv";
dotenv.config();

console.log("INDEX FILE RUNNING");

import cors from "cors";
import express, { Request } from "express";
import session from "express-session";
import { PrismaClient } from "../generated/prisma";
import {
  buildGraph,
  createDummyCourses,
  getAvailableCourses,
} from "./graduationPlanner/graph";
import aiRouter from "./routes/ai";
import authRouter from "./routes/auth";
import { degreeAudit } from "./services/degreeAuditService";
import { generateStudentPlan } from "./services/plannerService";
import { simulateFailure } from "./services/simulationService";

type completedCourseBody = {
  courseCode: string;
  userId: number;
};

type availableCoursesRequest = {
  userId: number;
};

type planAndDegreeAuditRequest = {
  userId: number;
  // maxCreditsPerSemester: number;
  // numberOfSemestersLeft: number;
};

type simulateFailureRequest = {
  userId: number;
  failedCourse: string;
};

type addCourseBody = {
  code: string;
  name: string;
  credits: number;
  school: string;
  prerequisiteCodes: string[];
};

const prisma = new PrismaClient();

const sessionMiddleware = session({
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // one day,
    sameSite: `lax`,
    secure: process.env.NODE_ENV === `production`,
  },
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || "dev_secret",
});

const app = express();

const portNumber = 3001;

app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
  }),
);

// app.use(cors());

app.use(express.json());
app.use(sessionMiddleware);

app.use("/auth", authRouter);
app.use("/chat", aiRouter);

app.listen(portNumber, () => {
  console.log(`Server running on port ${portNumber}`);
});

app.get("/", (_req, res) => {
  console.log("hello");
  res.json({ message: "xyz" });
});

app.get("/courses", (_req, res) => {
  console.log("courses");
  res.json({ courses: ["CSE 2231", "ENGR 1282.01"] });
});

app.post(
  "/create_course",
  async (req: Request<unknown, unknown, addCourseBody>, res) => {
    const courseData = req.body;

    const course = await prisma.course.create({
      data: courseData,
    });

    res.status(200).json({
      message: "Successfully created course.",
      course: course,
    });
  },
);

app.post("/create_dummy_courses", (_req, res) => {
  createDummyCourses();

  res.json({
    message: "created dummy courses successfully",
  });
});

app.get("/get_graph", async (_req, res) => {
  const graph = await buildGraph();

  return res.json({
    graph: graph,
  });
});

app.post(
  "/add_completed_course",
  async (req: Request<unknown, unknown, completedCourseBody>, res) => {
    const { courseCode, userId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      res.status(404).json({
        error: "Account does not exist",
      });
      return;
    }

    if (existingUser.completedCourses.includes(courseCode)) {
      res.status(409).json({
        message: "Course is already completed by this student.",
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        completedCourses: [...existingUser.completedCourses, courseCode],
      },
    });

    res.status(200).json({
      updatedUser: updatedUser,
    });
    return;
  },
);

app.get(
  "/available_courses",
  async (req: Request<unknown, unknown, availableCoursesRequest>, res) => {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.json(404).json({
        error: "Account does not exist.",
      });
      return;
    }

    const completedCourses = user.completedCourses;

    const graph = await buildGraph();

    const availableCourses = getAvailableCourses(graph, completedCourses);

    res.status(200).json({
      message: "Successfully fetched available courses.",
      availableCourses: availableCourses,
    });
  },
);

app.post(
  "/plan",
  async (req: Request<unknown, unknown, planAndDegreeAuditRequest>, res) => {
    const { userId } = req.body;

    // const graph = await buildGraph();
    // console.log("graph: ", graph);

    // const existingUser = await prisma.user.findUnique({
    //   where: { id: userId },
    // });

    // if (!existingUser) {
    //   res.status(404).json({
    //     error: "Account does not exist.",
    //   });
    //   return;
    // }

    // const completedCourses = existingUser.completedCourses;

    // console.log("completedCourses: " + completedCourses);

    // const allCourses = (await prisma.course.findMany()) as course[];

    // console.log("allCourses: " + allCourses);

    // const plan = generatePlan(
    //   graph,
    //   completedCourses,
    //   allCourses,
    //   maxCreditsPerSemester,
    //   numberOfSemestersLeft,
    // );

    const plan = await generateStudentPlan(userId);

    console.log("plan in backend: ", plan);

    res.status(200).json({
      message: "Successfully fetched plan.",
      plan: plan,
    });
    return;
  },
);

app.post(
  "/degreeAudit",
  async (req: Request<unknown, unknown, planAndDegreeAuditRequest>, res) => {
    const { userId } = req.body;
    const audit = await degreeAudit(userId);

    res.status(200).json({
      audit: audit,
    });
    return;
  },
);

app.post(
  "/simulateFailure",
  async (req: Request<unknown, unknown, simulateFailureRequest>, res) => {
    const { userId, failedCourse } = req.body;
    const failureSimulationResult = await simulateFailure(userId, failedCourse);

    res.status(200).json({
      failureSimulationResult: failureSimulationResult,
    });
    return;
  },
);
