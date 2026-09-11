import React, { useState } from 'react';
import {
  selectCartItems,
  selectBill,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { saveBillToFirestore } from '../firebase/billService';
import { isFirebaseConfigured } from '../firebase/config';
import { penceToDisplay, penceInline } from '../utils/currency';
import type { BillCalculation } from '../types';

function OffersBadge({ bill }: { bill: BillCalculation }) {
  if (bill.offers.length === 0) return null;
  return (
    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm space-y-1.5">
      <p className="font-semibold text-emerald-800">Applied offers</p>
      {bill.offers.map((offer, idx) => (
        <div key={idx} className="flex justify-between text-emerald-700">
          <span>{offer.offerName}</span>
          <span className="font-medium">- {penceInline(offer.savingPence)}</span>
        </div>
      ))}
    </div>
  );
}

const BasketPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const bill = useAppSelector(selectBill);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const savingsByProduct = bill.offers.reduce<Record<string, number>>((acc, offer) => {
    acc[offer.affectedProductId] = (acc[offer.affectedProductId] ?? 0) + offer.savingPence;
    return acc;
  }, {});

  const handleSave = async () => {
    setSaving(true);
    setSavedId(null);
    try {
      const id = await saveBillToFirestore({ cartItems, bill });
      setSavedId(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    dispatch(clearCart());
    setSavedId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Basket</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-400 text-center py-16">Your basket is empty</p>
      ) : (
        <>
          <div className="divide-y divide-gray-100 flex-1">
            {cartItems.map(({ product, quantity }) => {
              const itemSubtotal = product.pricePence * quantity;
              const productSavings = savingsByProduct[product.id] ?? 0;
              const itemCost = itemSubtotal - productSavings;

              return (
                <div key={product.id} className="py-4">
                  {/* Product row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="font-medium text-gray-800">{product.name}</span>
                      <span className="text-gray-400 text-sm">
                        {penceToDisplay(product.pricePence)}
                      </span>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Increase ${product.name}`}
                        onClick={() => dispatch(increaseQuantity(product.id))}
                        className="bg-blue-400 hover:bg-blue-500 text-white w-7 h-7 rounded flex items-center justify-center transition-colors select-none"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="6" y1="1" x2="6" y2="11"/>
                          <line x1="1" y1="6" x2="11" y2="6"/>
                        </svg>
                      </button>
                      <span className="w-6 text-center font-semibold text-gray-800 tabular-nums">
                        {quantity}
                      </span>
                      <button
                        aria-label={`Decrease ${product.name}`}
                        onClick={() => dispatch(decreaseQuantity(product.id))}
                        className="border border-blue-400 text-blue-400 hover:bg-blue-50 w-7 h-7 rounded flex items-center justify-center transition-colors select-none"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="1" y1="6" x2="11" y2="6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Breakdown lines */}
                  <p className="text-right text-xs text-gray-400 mt-1.5">
                    Item price {penceInline(product.pricePence)} * {quantity} ={' '}
                    {penceInline(itemSubtotal)}
                  </p>
                  {productSavings > 0 && (
                    <p className="text-right text-xs text-red-500 mt-0.5 font-medium">
                      Savings {penceInline(productSavings)}
                    </p>
                  )}
                  <p className="text-right text-sm text-gray-600 mt-0.5">
                    Item cost {penceInline(itemCost)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bill summary */}
          <div className="border-t border-gray-200 mt-3 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sub Total:</span>
              <span className="tabular-nums">{penceToDisplay(bill.subtotalPence)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Savings:</span>
              <span className="tabular-nums">{penceToDisplay(bill.totalSavingsPence)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total Amount:</span>
              <span className="tabular-nums">{penceToDisplay(bill.finalTotalPence)}</span>
            </div>
          </div>

          {/* Applied offers detail */}
          <OffersBadge bill={bill} />

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2 rounded text-sm font-medium transition-colors"
            >
              Clear Basket
            </button>
            {isFirebaseConfigured && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded text-sm font-semibold transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            )}
          </div>

          {savedId && (
            <p className="mt-2 text-center text-xs text-emerald-600">
              Saved!
              {/* Doc ID:{' '}
              <code className="font-mono bg-emerald-50 px-1 rounded">{savedId}</code> */}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default BasketPanel;
