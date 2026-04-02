export interface WorldContract {
  id: string;
  type: 'token' | 'creator' | 'mission' | 'community' | 'no-token';
  status: 'draft' | 'active' | 'paused' | 'archived';
  visibility: 'private' | 'unlisted' | 'public';
  ownerId: string;
  name: string;
}
