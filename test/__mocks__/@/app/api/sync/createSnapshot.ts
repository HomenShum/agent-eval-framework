export async function createSnapshotFromDb(_userId: string) {
  return {
    nodesById: {},
    relationsById: {},
    relationsByNodeId: {},
  } as any;
}

