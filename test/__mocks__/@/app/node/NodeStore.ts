export type Chip = { type: "text"; value: string } | { type: string; [k: string]: any };

export class NodeStore {
  public user: { id: string };
  public nodesById: Map<string, any> = new Map();
  public userRoot: any;
  public globalRoot: any;
  private seq = 0;

  constructor(user: { id: string }) {
    this.user = user;
    this.globalRoot = this.makeNode("global-root", [{ type: "text", value: "Global" }], {
      authorId: "global-admin",
      isPublic: true,
    });
    this.userRoot = this.makeNode(`${user.id}-root`, [{ type: "text", value: "User Root" }], {
      authorId: this.user.id,
      isPublic: false,
    });
    // Place userRoot under a top-level "Users" for parity with some tests
    const users = this.makeNode("users", [{ type: "text", value: "Users" }], { authorId: "system" });
    this.addEdge(users, this.userRoot, "child");
  }

  private genId(): string {
    this.seq += 1;
    return `n${this.seq.toString(36)}`;
  }

  private makeNode(id: string, content: Chip[], extra?: any) {
    const node = {
      id,
      content: content || [],
      relations: [] as any[],
      authorId: extra?.authorId ?? this.user.id,
      isPublic: !!extra?.isPublic,
    };
    this.nodesById.set(id, node);
    return node;
  }

  private addEdge(from: any, to: any, relationTypeId: string) {
    const rel = {
      relationTypeId,
      relationType: { id: relationTypeId },
      from,
      to,
    };
    from.relations.push(rel);
    to.relations.push(rel);
    return rel;
  }

  async addChildNode(opts: { parentId: string; nodeProps: { id?: string; content?: Chip[]; authorId?: string; isPublic?: boolean } }) {
    const parent = this.nodesById.get(opts.parentId);
    if (!parent) throw new Error("parent not found");
    const id = opts.nodeProps.id || this.genId();
    const content = opts.nodeProps.content || [{ type: "text", value: "Untitled" }];
    const authorId = opts.nodeProps.authorId ?? this.user.id;
    const isPublic = !!opts.nodeProps.isPublic;
    const node = this.makeNode(id, content, { authorId, isPublic });
    this.addEdge(parent, node, "child");
    return { node };
  }

  async addRelation(opts: { fromId: string; toId: string; relationTypeId: string }) {
    const from = this.nodesById.get(opts.fromId);
    const to = this.nodesById.get(opts.toId);
    if (!from || !to) throw new Error("endpoint not found");
    this.addEdge(from, to, opts.relationTypeId || "relatedTo");
    return { success: true };
  }

  async updateNode(opts: { nodeId: string; nodeProps: { content?: Chip[] } }) {
    const n = this.nodesById.get(opts.nodeId);
    if (!n) throw new Error("node not found");
    if (opts.nodeProps.content) n.content = opts.nodeProps.content;
    return { node: n };
  }
}

