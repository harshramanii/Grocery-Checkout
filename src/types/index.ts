export interface Product {
  id: string;
  name: string;
  pricePence: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OfferSaving {
  offerName: string;
  savingPence: number;
  affectedProductId: string;
}

export interface BillCalculation {
  subtotalPence: number;
  offers: OfferSaving[];
  totalSavingsPence: number;
  finalTotalPence: number;
}
