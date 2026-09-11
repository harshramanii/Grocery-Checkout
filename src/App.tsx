import React from 'react';
import ProductList from './components/ProductList';
import BasketPanel from './components/BasketPanel';

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grocery Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add products to your basket — special offers are applied automatically.
        </p>
      </header>
      <div className="flex gap-6 items-start">
        <div className="w-5/12">
          <ProductList />
        </div>
        <div className="w-7/12">
          <BasketPanel />
        </div>
      </div>
    </div>
  </div>
);

export default App;
