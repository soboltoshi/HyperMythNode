export interface ComputeQuoteContract {
  id: string;
  buyerId: string;
  sellerId: string;
  units: number;
  taskClass: string;
  score: number;
  price: number;
  accepted: boolean;
}
