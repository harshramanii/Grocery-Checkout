import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { PRODUCTS } from '../data/products';
import { calculateBill } from '../utils/offerCalculator';
import type { CartItem } from '../types';
import type { RootState } from './index';

interface RawCartItem {
  productId: string;
  quantity: number;
}

interface CartState {
  items: RawCartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const existing = state.items.find(i => i.productId === action.payload);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ productId: action.payload, quantity: 1 });
      }
    },
    increaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.productId === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity(state, action: PayloadAction<string>) {
      const idx = state.items.findIndex(i => i.productId === action.payload);
      if (idx === -1) return;
      if (state.items[idx].quantity <= 1) {
        state.items.splice(idx, 1);
      } else {
        state.items[idx].quantity -= 1;
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

const selectRawItems = (state: RootState) => state.cart.items;

export const selectCartItems = createSelector(
  selectRawItems,
  (rawItems): CartItem[] =>
    rawItems.flatMap(raw => {
      const product = PRODUCTS.find(p => p.id === raw.productId);
      return product ? [{ product, quantity: raw.quantity }] : [];
    }),
);

export const selectBill = createSelector(selectCartItems, calculateBill);
