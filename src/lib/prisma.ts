// MOCK PRISMA CLIENT - For Database-Free Deployment
// This prevents the app from crashing while we finalize the cloud database.

export const prisma = new Proxy({} as any, {
  get: (target, prop) => {
    // Return a mock object for any model name (e.g., prisma.user, prisma.post)
    return {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async (args: any) => args.data || {},
      update: async (args: any) => args.data || {},
      delete: async () => ({}),
      count: async () => 0,
      upsert: async (args: any) => args.create || {},
      aggregate: async () => ({}),
      groupBy: async () => [],
    };
  }
});
