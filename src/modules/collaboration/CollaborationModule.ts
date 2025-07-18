import { 
  ModuleAPI, 
  ServiceResponse, 
  CollaborationSession, 
  Participant, 
  Change, 
  Comment, 
  Suggestion,
  Document 
} from '../../types/platform';

/**
 * 协作功能模块
 * 提供实时协作、评论、建议和版本控制功能
 */
export class CollaborationModule implements ModuleAPI {
  private isInitialized = false;
  private sessions: Map<string, CollaborationSession> = new Map();
  private changes: Map<string, Change[]> = new Map(); // sessionId -> changes
  private comments: Map<string, Comment[]> = new Map(); // sessionId -> comments
  private suggestions: Map<string, Suggestion[]> = new Map(); // sessionId -> suggestions

  async initialize(): Promise<void> {
    try {
      // 初始化协作系统
      await this.setupCollaborationSystem();
      this.isInitialized = true;
      console.log('协作模块初始化完成');
    } catch (error) {
      console.error('协作模块初始化失败:', error);
      throw error;
    }
  }

  async process(request: any): Promise<ServiceResponse<any>> {
    if (!this.isInitialized) {
      throw new Error('协作模块未初始化');
    }

    try {
      const startTime = Date.now();
      let response;

      switch (request.action) {
        case 'createSession':
          response = await this.createSession(request);
          break;
        case 'joinSession':
          response = await this.joinSession(request);
          break;
        case 'leaveSession':
          response = await this.leaveSession(request);
          break;
        case 'addChange':
          response = await this.addChange(request);
          break;
        case 'addComment':
          response = await this.addComment(request);
          break;
        case 'addSuggestion':
          response = await this.addSuggestion(request);
          break;
        case 'getSessionData':
          response = await this.getSessionData(request);
          break;
        case 'syncChanges':
          response = await this.syncChanges(request);
          break;
        default:
          throw new Error(`未知的协作操作: ${request.action}`);
      }

      return {
        success: true,
        data: response,
        metadata: {
          requestId: `collab_${Date.now()}`,
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'COLLABORATION_ERROR',
          message: error instanceof Error ? error.message : '协作操作失败',
          details: error
        },
        metadata: {
          requestId: `collab_${Date.now()}`,
          timestamp: new Date(),
          processingTime: Date.now() - Date.now()
        }
      };
    }
  }

  async cleanup(): Promise<void> {
    this.sessions.clear();
    this.changes.clear();
    this.comments.clear();
    this.suggestions.clear();
    this.isInitialized = false;
    console.log('协作模块清理完成');
  }

  getStatus() {
    return {
      loaded: true,
      ready: this.isInitialized,
      lastUpdate: new Date(),
      performance: {
        averageResponseTime: 300,
        successRate: 0.99,
        errorCount: 0
      }
    };
  }

  // 创建协作会话
  private async createSession(request: {
    name: string;
    createdBy: string;
    document: Document;
    participants?: Participant[];
  }): Promise<CollaborationSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      name: request.name,
      createdBy: request.createdBy,
      participants: [
        {
          id: request.createdBy,
          name: request.createdBy,
          role: 'owner',
          status: 'online',
          lastSeen: new Date(),
          permissions: [
            { action: 'read', scope: 'document', granted: true },
            { action: 'write', scope: 'document', granted: true },
            { action: 'comment', scope: 'document', granted: true },
            { action: 'suggest', scope: 'document', granted: true },
            { action: 'approve', scope: 'document', granted: true }
          ]
        },
        ...(request.participants || [])
      ],
      document: request.document,
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, session);
    this.changes.set(sessionId, []);
    this.comments.set(sessionId, []);
    this.suggestions.set(sessionId, []);

    return session;
  }

  // 加入协作会话
  private async joinSession(request: {
    sessionId: string;
    participant: Participant;
  }): Promise<{ success: boolean; session?: CollaborationSession }> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    // 检查参与者是否已存在
    const existingParticipant = session.participants.find(p => p.id === request.participant.id);
    if (existingParticipant) {
      existingParticipant.status = 'online';
      existingParticipant.lastSeen = new Date();
    } else {
      session.participants.push({
        ...request.participant,
        status: 'online',
        lastSeen: new Date()
      });
    }

    session.lastActivity = new Date();
    return { success: true, session };
  }

  // 离开协作会话
  private async leaveSession(request: {
    sessionId: string;
    participantId: string;
  }): Promise<{ success: boolean }> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    const participant = session.participants.find(p => p.id === request.participantId);
    if (participant) {
      participant.status = 'offline';
      participant.lastSeen = new Date();
    }

    session.lastActivity = new Date();
    return { success: true };
  }

  // 添加变更
  private async addChange(request: {
    sessionId: string;
    change: Omit<Change, 'id' | 'timestamp' | 'approved'>;
  }): Promise<Change> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    const change: Change = {
      ...request.change,
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      approved: false
    };

    const sessionChanges = this.changes.get(request.sessionId) || [];
    sessionChanges.push(change);
    this.changes.set(request.sessionId, sessionChanges);

    // 更新文档内容（如果变更被自动批准）
    if (this.shouldAutoApprove(change, session)) {
      change.approved = true;
      await this.applyChange(session, change);
    }

    session.lastActivity = new Date();
    return change;
  }

  // 添加评论
  private async addComment(request: {
    sessionId: string;
    comment: Omit<Comment, 'id' | 'timestamp' | 'resolved' | 'replies'>;
  }): Promise<Comment> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    const comment: Comment = {
      ...request.comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };

    const sessionComments = this.comments.get(request.sessionId) || [];
    sessionComments.push(comment);
    this.comments.set(request.sessionId, sessionComments);

    session.lastActivity = new Date();
    return comment;
  }

  // 添加建议
  private async addSuggestion(request: {
    sessionId: string;
    suggestion: Omit<Suggestion, 'id' | 'status'>;
  }): Promise<Suggestion> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    const suggestion: Suggestion = {
      ...request.suggestion,
      id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending'
    };

    const sessionSuggestions = this.suggestions.get(request.sessionId) || [];
    sessionSuggestions.push(suggestion);
    this.suggestions.set(request.sessionId, sessionSuggestions);

    session.lastActivity = new Date();
    return suggestion;
  }

  // 获取会话数据
  private async getSessionData(request: {
    sessionId: string;
  }): Promise<{
    session: CollaborationSession;
    changes: Change[];
    comments: Comment[];
    suggestions: Suggestion[];
  }> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    return {
      session,
      changes: this.changes.get(request.sessionId) || [],
      comments: this.comments.get(request.sessionId) || [],
      suggestions: this.suggestions.get(request.sessionId) || []
    };
  }

  // 同步变更
  private async syncChanges(request: {
    sessionId: string;
    lastSyncTime?: Date;
  }): Promise<{
    changes: Change[];
    comments: Comment[];
    suggestions: Suggestion[];
    document: Document;
  }> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    const lastSync = request.lastSyncTime || new Date(0);
    
    const recentChanges = (this.changes.get(request.sessionId) || [])
      .filter(change => change.timestamp > lastSync);
    
    const recentComments = (this.comments.get(request.sessionId) || [])
      .filter(comment => comment.timestamp > lastSync);
    
    const recentSuggestions = (this.suggestions.get(request.sessionId) || [])
      .filter(suggestion => suggestion.position.start > 0); // 简单过滤

    return {
      changes: recentChanges,
      comments: recentComments,
      suggestions: recentSuggestions,
      document: session.document
    };
  }

  // 辅助方法：判断是否应该自动批准变更
  private shouldAutoApprove(change: Change, session: CollaborationSession): boolean {
    const author = session.participants.find(p => p.id === change.author);
    if (!author) return false;

    // 所有者和编辑者的变更自动批准
    return author.role === 'owner' || author.role === 'editor';
  }

  // 辅助方法：应用变更到文档
  private async applyChange(session: CollaborationSession, change: Change): Promise<void> {
    const document = session.document;
    let content = document.content;

    switch (change.type) {
      case 'insert':
        content = content.slice(0, change.position.start) + 
                 change.content + 
                 content.slice(change.position.start);
        break;
      case 'delete':
        content = content.slice(0, change.position.start) + 
                 content.slice(change.position.end);
        break;
      case 'modify':
        content = content.slice(0, change.position.start) + 
                 change.content + 
                 content.slice(change.position.end);
        break;
    }

    // 更新文档
    document.content = content;
    document.updatedAt = new Date();
    document.metadata.wordCount = content.split(/\s+/).length;
    document.metadata.characterCount = content.length;
  }

  // 初始化协作系统
  private async setupCollaborationSystem(): Promise<void> {
    // 设置实时通信（在实际应用中可能使用WebSocket）
    console.log('协作系统设置完成');
  }

  // 公共方法：获取活跃会话
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'active');
  }

  // 公共方法：获取用户参与的会话
  getUserSessions(userId: string): CollaborationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => 
        session.participants.some(p => p.id === userId)
      );
  }

  // 公共方法：批准建议
  async approveSuggestion(sessionId: string, suggestionId: string, approverId: string): Promise<boolean> {
    const suggestions = this.suggestions.get(sessionId) || [];
    const suggestion = suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) return false;

    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const approver = session.participants.find(p => p.id === approverId);
    if (!approver || !approver.permissions.some(p => p.action === 'approve' && p.granted)) {
      return false;
    }

    suggestion.status = 'accepted';
    
    // 应用建议到文档
    const change: Change = {
      id: `change_from_suggestion_${suggestionId}`,
      type: 'modify',
      content: suggestion.suggested,
      position: suggestion.position,
      author: approverId,
      timestamp: new Date(),
      approved: true
    };

    await this.applyChange(session, change);
    return true;
  }

  // 公共方法：拒绝建议
  async rejectSuggestion(sessionId: string, suggestionId: string): Promise<boolean> {
    const suggestions = this.suggestions.get(sessionId) || [];
    const suggestion = suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) return false;

    suggestion.status = 'rejected';
    return true;
  }
}