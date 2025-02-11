import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

export async function getUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany();
    res.json({
      status: true,
      message: "Users Successfully fetched",
      data: users,
    });
  }
  
  export async function getUser(req: Request, res: Response) {
    const { userid } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        id: userid,
      },
    });
    res.json({
      status: true,
      message: "User Successfully fetched",
      data: user,
    });
  }
  export async function createUser(req: Request, res: Response) {
    try {
      const { name, email, password, dob, gender, gamePreferences,  profilePhoto,city} = req.body;
      
    
    const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          dob,
          gender,
          gamePreferences,
          profilePhoto,
          city,
        },
      });
  
      res.status(201).json({
        status: true,
        message: "User Successfully Created",
        data: user,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
  
      res.status(500).json({
        status: false,
        message: error.message || "Server error",
      });
    }
  }
  