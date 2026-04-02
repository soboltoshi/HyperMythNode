export interface MediaJobContract {
  id: string;
  targetId: string;
  targetType: 'world' | 'stream' | 'mission' | 'launch';
  mediaType: 'clip' | 'report' | 'chart' | 'video';
  status: 'queued' | 'processing' | 'done' | 'failed';
}
