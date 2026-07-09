import bcrypt from "bcrypt";
import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import process from "process";
import { PrismaClient } from "../../generated/prisma";
import { AuthRequest } from "../types/authRequest";

const router = express.Router();
const prisma = new PrismaClient();

interface SignupRequestBody {
  username: string;
  password: string;
  school: string;
  gradYear: number;
}

interface loginRequestBody {
  username: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("Missing token");
    res.status(401).json({
      error: "Missing token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = payload;

    next();
  } catch {
    res.status(401).json({
      error: "Invalid token",
    });
    return;
  }
}

router.post(
  "/signup",
  async (req: Request<unknown, unknown, SignupRequestBody>, res: Response) => {
    console.log("Sign up");
    const { username, password, school, gradYear } = req.body;
    try {
      if (!username || !password || !school || !gradYear) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const existingUser = await prisma.user.findFirst({
        where: { username },
      });

      if (existingUser) {
        res.status(409).json({
          error: "User already exists",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          school,
          gradYear,
        },
      });

      res.status(201).json({
        message: "User added successfully",
        userId: newUser.id,
      });

      return;
    } catch (error) {
      console.error("Signup error: ", error);
      res.status(500).json({
        error: "Internal Server Error",
      });
      return;
    }
  },
);

router.post(
  "/login",
  async (req: Request<unknown, unknown, loginRequestBody>, res: Response) => {
    console.log("login");
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({
        error: "All fields required",
      });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { username },
    });

    if (!existingUser) {
      res.status(404).json({
        error: "Account does not exist. Sign up instead.",
      });
      return;
    }

    // const encryptedPassword = ;
    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!passwordCorrect) {
      res.status(401).json({
        error: "Invalid credentials",
      });
      return;
    }

    // req.session.userId = existingUser.id;
    // req.session.userName = existingUser.username;
    // console.log("userId after login: " + req.session.userId);
    // console.log("userName after login: " + req.session.userName);

    const userId = existingUser.id;
    const school = existingUser.school;
    const gradYear = existingUser.gradYear;

    res.status(201).json({
      message: "Logged in successfully",
      user: {
        id: userId,
        name: username,
        school: school,
        gradYear: gradYear,
      },
      jwt: jwt.sign(
        {
          userId,
          username,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "15m",
        },
      ),
    });
    return;
  },

  router.get("/me", async (req: Request, res: Response) => {
    if (req.session.userId == null) {
      res.status(400).json({
        message: "Not logged in",
      });
      return;
    }
    res.status(201).json({
      username: req.session.userName,
      userId: req.session.userId,
    });
    return;
  }),
);

export default router;
