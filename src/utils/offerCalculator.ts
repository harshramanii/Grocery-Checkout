import type { CartItem, OfferSaving, BillCalculation } from '../types';

const qty = (items: CartItem[], id: string): number =>
  items.find(i => i.product.id === id)?.quantity ?? 0;

const price = (items: CartItem[], id: string): number =>
  items.find(i => i.product.id === id)?.product.pricePence ?? 0;

export function calculateBill(items: CartItem[]): BillCalculation {
  const subtotalPence = items.reduce(
    (sum, { product, quantity }) => sum + product.pricePence * quantity,
    0,
  );

  const offers: OfferSaving[] = [];

  // Buy a Cheese → get a second Cheese free (BOGO, per pair)
  const cheeseQty = qty(items, 'cheese');
  if (cheeseQty >= 2) {
    const freeCount = Math.floor(cheeseQty / 2);
    offers.push({
      offerName: `Buy Cheese get Cheese free (×${freeCount})`,
      savingPence: freeCount * price(items, 'cheese'),
      affectedProductId: 'cheese',
    });
  }

  // Buy a Soup → get half-price Bread (one discounted bread per soup)
  const soupQty = qty(items, 'soup');
  const breadQty = qty(items, 'bread');
  if (soupQty > 0 && breadQty > 0) {
    const discounted = Math.min(soupQty, breadQty);
    offers.push({
      offerName: `Soup & half-price Bread (×${discounted})`,
      savingPence: discounted * Math.floor(price(items, 'bread') / 2),
      affectedProductId: 'bread',
    });
  }

  // Get a third off Butter
  const butterQty = qty(items, 'butter');
  if (butterQty > 0) {
    offers.push({
      offerName: `Third off Butter (×${butterQty})`,
      savingPence: butterQty * Math.floor(price(items, 'butter') / 3),
      affectedProductId: 'butter',
    });
  }

  const totalSavingsPence = offers.reduce((sum, o) => sum + o.savingPence, 0);

  return {
    subtotalPence,
    offers,
    totalSavingsPence,
    finalTotalPence: subtotalPence - totalSavingsPence,
  };
}
