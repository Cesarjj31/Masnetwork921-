import * as schema from './schema'

let cachedDb: any = null

export function database() {
  if (cachedDb) return cachedDb
  try {
    // Attempt lazy netlify-db connection if environment is present
    const { drizzle } = require('drizzle-orm/netlify-db')
    cachedDb = drizzle({ schema })
    return cachedDb
  } catch {
    // In-memory mock fallback for local and AI Studio environments
    const noOp = {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (d: any) => d?.data ?? {},
      update: async (d: any) => d?.data ?? {},
      delete: async () => ({}),
    }
    cachedDb = new Proxy({}, {
      get: (_, prop) =>
        prop === 'query'
          ? new Proxy({}, { get: () => noOp })
          : () => ({
              where: () => ({
                limit: () => [],
                onConflictDoUpdate: async () => ({}),
              }),
              values: () => ({
                onConflictDoUpdate: async () => ({}),
              }),
              from: () => ({
                where: async () => [],
              }),
              delete: () => ({
                where: async () => ({}),
              }),
              insert: () => ({
                values: () => ({
                  onConflictDoUpdate: async () => ({}),
                }),
              }),
              select: () => ({
                from: () => ({
                  where: async () => [],
                }),
              }),
            }),
    })
    return cachedDb
  }
}
