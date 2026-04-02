export interface SessionContract {
  id: string;
  type: string;
  activeFrom: string;
  expiresAt: string;
  sourceBlock: string;
  ownerId: string;
}
