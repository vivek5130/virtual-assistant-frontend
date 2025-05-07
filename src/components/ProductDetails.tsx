// ProductDetails.tsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
  image: string;
};

type Props = {
  product: Product;
  onBack: () => void;
};

const ProductDetails: React.FC<Props> = ({ product, onBack }) => {
  return (
    <div className="sticky top-4">
      <button
        onClick={onBack}
        className="text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Back to chat
      </button>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-contain mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {product.name}
        </h2>
        <p className="text-2xl font-bold text-indigo-600 mb-4">
          ${product.price}
        </p>
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: product.rating }).map((_, i) => (
            <span key={i} className="text-yellow-400">★</span>
          ))}
        </div>
        <p className="text-gray-600 mb-6">{product.description}</p>
        <button
          onClick={() => window.open(`/purchase/${product._id}`, '_blank')}
          className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Purchase Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
