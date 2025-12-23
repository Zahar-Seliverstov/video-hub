import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prismaClient = new PrismaClient({
    adapter,
    log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
    ],
});

prismaClient.$on("query", (e) => {
    // logger.info(`prisma:query: ${e.query}`);
    // logger.info(`prisma:params: ${e.par ms}`);
    // logger.info(`prisma:duration: ${e.duration}ms`);
});

prismaClient.$on("error", (e) => {});

prismaClient.$on("warn", (e) => {});

prismaClient.$on("info", (e) => {});

prismaClient
    .$connect()
    .then(() => {})
    .catch((error) => {
        process.exit(1);
    });

export default prismaClient;
