import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const client = new PrismaClient({ adapter });

  // Wrap each model to gracefully handle connection failures on reads
  return new Proxy(client, {
    get(target, model: string) {
      const orig = Reflect.get(target, model);
      if (typeof orig !== "object" || orig === null) return orig;

      return new Proxy(orig, {
        get(obj, method: string) {
          const fn = Reflect.get(obj, method);
          if (typeof fn !== "function") return fn;

          const readMethods = [
            "findMany", "findFirst", "findUnique", "count",
            "findUniqueOrThrow", "aggregate", "groupBy",
          ];
          if (!readMethods.includes(method)) return fn;

          return (...args: unknown[]) => {
            try {
              const result = fn.apply(obj, args);
              if (result && typeof result === "object" && "catch" in result) {
                return (result as Promise<unknown>).catch((err: { code?: string }) => {
                  if (err?.code === "P1010" || err?.code === "P1001") {
                    console.warn(`[db] Database unavailable for ${model}.${method}()`);
                    return method === "count" ? 0 : method === "findFirst" || method === "findUnique" || method === "findUniqueOrThrow" ? null : [];
                  }
                  throw err;
                });
              }
              return result;
            } catch (err: unknown) {
              const e = err as { code?: string };
              if (e?.code === "P1010" || e?.code === "P1001") {
                console.warn(`[db] Database unavailable for ${model}.${method}()`);
                return method === "count" ? 0 : null;
              }
              throw err;
            }
          };
        },
      });
    },
  }) as PrismaClient;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
