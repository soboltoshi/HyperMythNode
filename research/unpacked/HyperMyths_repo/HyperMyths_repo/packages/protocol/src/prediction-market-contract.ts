export interface PredictionMarketContract {
  id: string;
  subject: string;
  choices: string[];
  status: 'draft' | 'open' | 'closed' | 'resolved';
  oracleSource: string;
}
