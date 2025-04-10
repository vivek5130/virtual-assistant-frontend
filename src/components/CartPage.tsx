import  { useEffect, useState } from "react";

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    rating: number;
    image: string;
  };

const CartPage = () => {
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const handleRemove = (id: string) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🛒 Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cart.map((item) => (
            <div key={item._id} className="border p-3 rounded shadow">
              <img src={item.image} alt={item.name} className="h-24 w-full object-contain" />
              <h4 className="mt-2 font-semibold">{item.name}</h4>
              <p className="text-indigo-600 font-bold">₹{item.price}</p>
              <button
                onClick={() => handleRemove(item._id)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;
