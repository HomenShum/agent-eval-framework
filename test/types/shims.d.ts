declare module "uuid" {
  export const v4: () => string;
}

declare module "@pinecone-database/pinecone" {
  export class Pinecone {
    constructor(opts: any);
    Index(name: string): any;
    inference: {
      embed: (
        model: string,
        inputs: any[],
        opts: any,
      ) => Promise<{ data: Array<{ values: number[] }> }>;
    };
  }
}

declare module "@/envBackend" {
  export const env: any;
}

declare module "@/lib/pinecone" {
  export function pgConnectionStringToPineconeIndexName(conn: string): string;
}

declare module "@/app/api/sync/createSnapshot" {
  export function createSnapshotFromDb(userId: string): Promise<any>;
}



declare module "@/app/auth/User" {
  export const MOCK_USER: any;
}

declare module "@/app/node/NodeStore" {
  export class NodeStore {
    constructor(user: any);
    user: any;
    userRoot: any;
    globalRoot: any;
    nodesById: Map<string, any>;
    addChildNode(opts: any): Promise<{ node: any }>;
    addRelation(opts: any): Promise<{ success: boolean }>;
    updateNode(opts: any): Promise<{ node: any }>;
  }
}

declare module "@/lib/constants" {
  export const GLOBAL_ADMIN_USER_ID: string;
}
