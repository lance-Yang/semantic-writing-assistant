import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, MessageCircle, Edit3, Eye, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { CollaborationSession, Participant, Comment, Change } from '../../types/platform';

export const CollaborationTool: React.FC = () => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('sessions');

  // 模拟数据
  useEffect(() => {
    const mockSessions: CollaborationSession[] = [
      {
        id: 'session_1',
        name: '产品发布文案协作',
        createdBy: 'user_1',
        participants: [
          {
            id: 'user_1',
            name: '张三',
            role: 'owner',
            status: 'online',
            lastSeen: new Date(),
            permissions: [
              { action: 'read', scope: 'document', granted: true },
              { action: 'write', scope: 'document', granted: true },
              { action: 'comment', scope: 'document', granted: true }
            ]
          },
          {
            id: 'user_2',
            name: '李四',
            role: 'editor',
            status: 'online',
            lastSeen: new Date(),
            permissions: [
              { action: 'read', scope: 'document', granted: true },
              { action: 'write', scope: 'document', granted: true },
              { action: 'comment', scope: 'document', granted: true }
            ]
          }
        ],
        document: {
          id: 'doc_1',
          title: '新产品发布文案',
          content: '这是一个关于新产品发布的文案内容...',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            wordCount: 150,
            characterCount: 450,
            tags: ['产品', '发布', '营销'],
            language: 'zh-CN'
          }
        },
        status: 'active',
        createdAt: new Date(),
        lastActivity: new Date()
      }
    ];
    setSessions(mockSessions);
  }, []);

  const handleCreateSession = () => {
    if (!newSessionName.trim()) return;

    const newSession: CollaborationSession = {
      id: `session_${Date.now()}`,
      name: newSessionName,
      createdBy: 'current_user',
      participants: [
        {
          id: 'current_user',
          name: '当前用户',
          role: 'owner',
          status: 'online',
          lastSeen: new Date(),
          permissions: [
            { action: 'read', scope: 'document', granted: true },
            { action: 'write', scope: 'document', granted: true },
            { action: 'comment', scope: 'document', granted: true },
            { action: 'approve', scope: 'document', granted: true }
          ]
        }
      ],
      document: {
        id: `doc_${Date.now()}`,
        title: newSessionName,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          wordCount: 0,
          characterCount: 0,
          tags: [],
          language: 'zh-CN'
        }
      },
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    setSessions([...sessions, newSession]);
    setNewSessionName('');
    setShowCreateForm(false);
  };

  const handleJoinSession = (session: CollaborationSession) => {
    setSelectedSession(session);
    setActiveTab('workspace');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'commenter': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'online' 
      ? 'bg-green-500' 
      : 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">协作功能</h1>
          <p className="text-gray-600 dark:text-gray-400">与团队成员实时协作编辑文档</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">协作会话</TabsTrigger>
          <TabsTrigger value="workspace" disabled={!selectedSession}>协作空间</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        {/* 协作会话列表 */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">我的协作会话</h2>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              创建会话
            </Button>
          </div>

          {/* 创建会话表单 */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>创建新的协作会话</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    会话名称
                  </label>
                  <Input
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="输入会话名称..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateSession}>创建</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 会话列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{session.name}</CardTitle>
                      <Badge 
                        variant={session.status === 'active' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {session.status === 'active' ? '活跃' : '暂停'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {session.lastActivity.toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 参与者 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        参与者 ({session.participants.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {session.participants.slice(0, 3).map((participant) => (
                          <div key={participant.id} className="flex items-center gap-1">
                            <div 
                              className={`w-2 h-2 rounded-full ${getStatusColor(participant.status)}`}
                            ></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {participant.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getRoleColor(participant.role)}`}
                            >
                              {participant.role === 'owner' ? '所有者' : 
                               participant.role === 'editor' ? '编辑者' : 
                               participant.role === 'viewer' ? '查看者' : '评论者'}
                            </Badge>
                          </div>
                        ))}
                        {session.participants.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{session.participants.length - 3} 更多
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 文档信息 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        文档
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.document.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.document.metadata.wordCount} 字
                      </p>
                    </div>

                    <Button 
                      onClick={() => handleJoinSession(session)}
                      className="w-full"
                    >
                      进入协作
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无协作会话</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="mt-4"
              >
                创建第一个会话
              </Button>
            </div>
          )}
        </TabsContent>

        {/* 协作空间 */}
        <TabsContent value="workspace" className="space-y-6">
          {selectedSession && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedSession.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="default">协作中</Badge>
                  <span className="text-sm text-gray-500">
                    {selectedSession.participants.filter(p => p.status === 'online').length} 人在线
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 文档编辑区 */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5" />
                        {selectedSession.document.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={selectedSession.document.content}
                        onChange={(e) => {
                          // 在实际应用中，这里会触发实时同步
                          const updatedSession = {
                            ...selectedSession,
                            document: {
                              ...selectedSession.document,
                              content: e.target.value
                            }
                          };
                          setSelectedSession(updatedSession);
                        }}
                        placeholder="开始协作编辑..."
                        className="min-h-[400px] font-mono"
                      />
                      <div className="mt-4 flex justify-between text-sm text-gray-500">
                        <span>字数: {selectedSession.document.content.length}</span>
                        <span>最后更新: {selectedSession.document.updatedAt.toLocaleTimeString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 侧边栏 */}
                <div className="space-y-4">
                  {/* 在线用户 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">在线用户</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedSession.participants
                          .filter(p => p.status === 'online')
                          .map((participant) => (
                          <div key={participant.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">{participant.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getRoleColor(participant.role)}`}
                            >
                              {participant.role === 'owner' ? '所有者' : 
                               participant.role === 'editor' ? '编辑者' : '查看者'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 快速评论 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">快速评论</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="添加评论..."
                          className="min-h-[80px]"
                        />
                        <Button 
                          size="sm" 
                          className="w-full"
                          disabled={!newComment.trim()}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          发表评论
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 文档统计 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">文档统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>字数</span>
                          <span>{selectedSession.document.metadata.wordCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>字符数</span>
                          <span>{selectedSession.document.metadata.characterCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>创建时间</span>
                          <span>{selectedSession.document.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* 历史记录 */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>协作历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                    <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">张三</span>
                      <span className="text-xs text-gray-500">编辑了文档</span>
                      <span className="text-xs text-gray-400">2分钟前</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      修改了第二段的内容描述
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                    <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">李四</span>
                      <span className="text-xs text-gray-500">添加了评论</span>
                      <span className="text-xs text-gray-400">5分钟前</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "这个标题需要更有吸引力一些"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                    <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">张三</span>
                      <span className="text-xs text-gray-500">邀请了新成员</span>
                      <span className="text-xs text-gray-400">10分钟前</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      邀请李四加入协作
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};