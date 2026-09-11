import React from 'react';
import { PRODUCTS } from '../data/products';
import { addToCart } from '../store/cartSlice';
import { useAppDispatch } from '../hooks/store';
import { penceToDisplay } from '../utils/currency';

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Products</h2>
      <div className="divide-y divide-gray-100">
        {PRODUCTS.map(product => (
          <div key={product.id} className="flex items-center justify-between py-3">
            <span className="text-gray-800 font-medium">{product.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm w-14 text-right">
                {penceToDisplay(product.pricePence)}
              </span>
              <button
                onClick={() => dispatch(addToCart(product.id))}
                className="bg-blue-400 hover:bg-blue-500 active:scale-95 text-white px-5 py-1.5 rounded text-sm font-semibold transition-all"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
