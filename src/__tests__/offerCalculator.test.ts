import { describe, it, expect } from 'vitest';
import { calculateBill } from '../utils/offerCalculator';
import type { CartItem, Product } from '../types';

// ── Test fixtures ────────────────────────────────────────────────────────────
const BREAD:  Product = { id: 'bread',  name: 'Bread',  pricePence: 110 };
const MILK:   Product = { id: 'milk',   name: 'Milk',   pricePence: 50  };
const CHEESE: Product = { id: 'cheese', name: 'Cheese', pricePence: 90  };
const SOUP:   Product = { id: 'soup',   name: 'Soup',   pricePence: 60  };
const BUTTER: Product = { id: 'butter', name: 'Butter', pricePence: 120 };

const item = (product: Product, quantity: number): CartItem => ({ product, quantity });

// ── Tests ────────────────────────────────────────────────────────────────────
describe('calculateBill', () => {
  it('returns zero totals for an empty cart', () => {
    const bill = calculateBill([]);
    expect(bill.subtotalPence).toBe(0);
    expect(bill.totalSavingsPence).toBe(0);
    expect(bill.finalTotalPence).toBe(0);
    expect(bill.offers).toHaveLength(0);
  });

  it('calculates subtotal correctly with no applicable offers', () => {
    const bill = calculateBill([item(BREAD, 1), item(MILK, 2)]);
    expect(bill.subtotalPence).toBe(110 + 100);   // 210p
    expect(bill.totalSavingsPence).toBe(0);
    expect(bill.finalTotalPence).toBe(210);
    expect(bill.offers).toHaveLength(0);
  });

  // Offer 1: Cheese BOGO ─────────────────────────────────────────────────────
  describe('Cheese BOGO (buy 1 get 1 free)', () => {
    it('1 cheese → no offer triggered', () => {
      expect(calculateBill([item(CHEESE, 1)]).offers).toHaveLength(0);
    });

    it('2 cheeses → 1 free, save 90p', () => {
      const bill = calculateBill([item(CHEESE, 2)]);
      expect(bill.offers).toHaveLength(1);
      expect(bill.offers[0].savingPence).toBe(90);
      expect(bill.finalTotalPence).toBe(90);   // pay for 1 only
    });

    it('3 cheeses → 1 free, save 90p', () => {
      expect(calculateBill([item(CHEESE, 3)]).offers[0].savingPence).toBe(90);
    });

    it('4 cheeses → 2 free, save 180p', () => {
      expect(calculateBill([item(CHEESE, 4)]).offers[0].savingPence).toBe(180);
    });

    it('saving is applied to the cheese product', () => {
      const { offers } = calculateBill([item(CHEESE, 2)]);
      expect(offers[0].affectedProductId).toBe('cheese');
    });
  });

  // Offer 2: Soup + half-price Bread ─────────────────────────────────────────
  describe('Soup → half-price Bread', () => {
    it('soup with no bread → no offer', () => {
      expect(calculateBill([item(SOUP, 1)]).offers).toHaveLength(0);
    });

    it('bread with no soup → no offer', () => {
      expect(calculateBill([item(BREAD, 1)]).offers).toHaveLength(0);
    });

    it('1 soup + 1 bread → save 55p (half of £1.10)', () => {
      const bill = calculateBill([item(SOUP, 1), item(BREAD, 1)]);
      expect(bill.offers).toHaveLength(1);
      expect(bill.offers[0].savingPence).toBe(55);
      expect(bill.finalTotalPence).toBe(115);  // 60 + 110 - 55
    });

    it('1 soup + 3 breads → only 1 bread discounted, save 55p', () => {
      expect(calculateBill([item(SOUP, 1), item(BREAD, 3)]).offers[0].savingPence).toBe(55);
    });

    it('2 soups + 3 breads → 2 breads discounted, save 110p', () => {
      expect(calculateBill([item(SOUP, 2), item(BREAD, 3)]).offers[0].savingPence).toBe(110);
    });

    it('saving is applied to the bread product', () => {
      const { offers } = calculateBill([item(SOUP, 1), item(BREAD, 1)]);
      expect(offers[0].affectedProductId).toBe('bread');
    });
  });

  // Offer 3: Butter 1/3 off ──────────────────────────────────────────────────
  describe('Butter — one third off', () => {
    it('1 butter → save 40p (£1.20 / 3)', () => {
      const bill = calculateBill([item(BUTTER, 1)]);
      expect(bill.offers).toHaveLength(1);
      expect(bill.offers[0].savingPence).toBe(40);
      expect(bill.finalTotalPence).toBe(80);
    });

    it('2 butters → save 80p', () => {
      expect(calculateBill([item(BUTTER, 2)]).offers[0].savingPence).toBe(80);
    });

    it('saving is applied to the butter product', () => {
      const { offers } = calculateBill([item(BUTTER, 1)]);
      expect(offers[0].affectedProductId).toBe('butter');
    });
  });

  // Screenshot sample ─────────────────────────────────────────────────────────
  describe('Screenshot sample: 1 Soup + 3 Bread + 1 Butter', () => {
    it('subtotal £5.10, savings £0.95, total £4.15', () => {
      const bill = calculateBill([item(SOUP, 1), item(BREAD, 3), item(BUTTER, 1)]);
      expect(bill.subtotalPence).toBe(510);   // 60 + 330 + 120
      expect(bill.totalSavingsPence).toBe(95); // 55 + 40
      expect(bill.finalTotalPence).toBe(415);
      expect(bill.offers).toHaveLength(2);
    });
  });

  // Multiple simultaneous offers ──────────────────────────────────────────────
  describe('Multiple offers at once', () => {
    it('applies all three offers independently', () => {
      const bill = calculateBill([
        item(CHEESE, 2),
        item(SOUP, 1),
        item(BREAD, 1),
        item(BUTTER, 2),
      ]);
      expect(bill.offers).toHaveLength(3);
      // cheese: 1 free = 90p, bread: 55p, butter ×2: 80p
      expect(bill.totalSavingsPence).toBe(90 + 55 + 80);
    });
  });
});
