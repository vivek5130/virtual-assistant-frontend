
import { Link } from 'react-router-dom';

type Product = {
    _id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    rating: number;
    image: string;
  };
  
  interface Props {
    product: Product;
  }

const ProductCard = ({ product }: Props) => {
  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2 capitalize">{product.category}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
            <div className="flex items-center">
              {Array.from({ length: product.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
