export interface LivestreamRoomContract {
  id: string;
  worldId?: string;
  title: string;
  streamState: 'offline' | 'live' | 'ended';
  viewerCount: number;
}
