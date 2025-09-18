export class Pinecone {
  constructor(_opts: any) {}
  Index(_name: string) {
    const namespaceObj = {
      async query(_opts: any) {
        return { matches: [] } as any;
      },
      async upsert(_records: any) {
        return { upsertedCount: Array.isArray(_records) ? _records.length : 0 } as any;
      },
    };
    return {
      namespace(_ns: string) {
        return namespaceObj;
      },
    } as any;
  }
  inference = {
    embed: async (_model: string, inputs: any[], _opts: any) => ({
      data: (inputs || []).map(() => ({ values: new Array(1536).fill(0) })),
    }),
  };
}

