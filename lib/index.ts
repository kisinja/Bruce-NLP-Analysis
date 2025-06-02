import { PrismaClient } from "./generated/prisma";
import { createClerkClient } from '@clerk/backend';

const myPrismaClient = new PrismaClient();

export default myPrismaClient;


export const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });