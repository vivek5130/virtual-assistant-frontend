// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';

// type Product = {
//   _id: string;
//   name: string;
//   category: string;
//   price: number;
//   description: string;
//   rating: number;
//   image: string;
// };

// interface ProductDetailsProps {
//   products: Product[];
// }

// export default function ProductDetails({ products }: ProductDetailsProps) {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const product = products.find(p => p._id === id);

//   if (!product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
//           <button
//             onClick={() => navigate('/')}
//             className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
//           >
//             <ArrowLeft className="mr-2 h-5 w-5" />
//             Back to home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <button
//           onClick={() => navigate('/')}
//           className="mb-8 inline-flex items-center text-indigo-600 hover:text-indigo-500"
//         >
//           <ArrowLeft className="mr-2 h-5 w-5" />
//           Back to home
//         </button>

//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
//             <div className="aspect-w-1 aspect-h-1">
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-96 object-contain rounded-lg"
//               />
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
//                 <p className="mt-2 text-sm text-gray-500">{product.category}</p>
//               </div>

//               <div className="flex items-center">
//                 <div className="flex items-center">
//                   {Array.from({ length: product.rating }).map((_, i) => (
//                     <Star
//                       key={i}
//                       className="h-5 w-5 text-yellow-400 fill-current"
//                     />
//                   ))}
//                 </div>
//                 <span className="ml-2 text-sm text-gray-500">
//                   {product.rating} out of 5 stars
//                 </span>
//               </div>

//               <div>
//                 <h2 className="sr-only">Product information</h2>
//                 <p className="text-3xl text-gray-900">${product.price}</p>
//               </div>

//               <div>
//                 <h3 className="text-sm font-medium text-gray-900">Description</h3>
//                 <p className="mt-2 text-sm text-gray-500">{product.description}</p>
//               </div>

//               <div className="mt-8 space-y-4">
//                 <button className="w-full bg-indigo-600 text-white py-3 px-8 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center">
//                   <ShoppingCart className="mr-2 h-5 w-5" />
//                   Add to Cart
//                 </button>
//                 <button className="w-full bg-gray-100 text-gray-900 py-3 px-8 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
//                   Buy Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";

// type Product = {
//   _id: string;
//   name: string;
//   image: string;
//   price: number;
//   description: string;
//   rating?: number;
// };

// function ProductDetails() {
//   const { id } = useParams();
//   const [product, setProduct] = useState<Product | null>(null);

//   useEffect(() => {
//     axios.get("http://localhost:5000/api/products").then((res) => {
//       const found = res.data.find((p: Product) => p._id === id);
//       console.log(id)
//       setProduct(found);
//     });
//   }, [id]);

//   if (!product) return <div className="p-4">Loading...</div>;

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <img src={product.image} alt={product.name} className="w-full h-64 object-contain" />
//       <h2 className="text-2xl font-bold mt-4">{product.name}</h2>
//       <p className="text-gray-600 text-lg mt-2">₹{product.price}</p>
//       <p className="text-sm text-gray-700 mt-4">{product.description}</p>
//       <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded">
//         Buy Now
//       </button>
//     </div>
//   );
// }

// export default ProductDetails;



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
