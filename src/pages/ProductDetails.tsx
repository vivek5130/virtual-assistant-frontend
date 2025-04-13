import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
type Product = {
    _id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    rating: number;
    image: string;
  };
  

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  if (!product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-10">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <img src={product.image} alt={product.name} className="w-full h-96 object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-gray-500 text-lg mb-2 capitalize">{product.category}</p>
          <div className="flex items-center mb-4">
            <span className="text-yellow-400 text-lg mr-2">{"★".repeat(product.rating)}</span>
            <span className="text-sm text-gray-600">({product.rating}/5)</span>
          </div>
          <p className="text-4xl font-bold text-indigo-600 mb-6">₹{product.price}</p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all text-lg shadow-md">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
