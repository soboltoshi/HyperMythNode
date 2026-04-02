export interface AgentTaskContract {
  id: string;
  agentId: string;
  taskType: string;
  priority: 'low' | 'normal' | 'high';
  status: 'queued' | 'running' | 'done' | 'failed';
}
