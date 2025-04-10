import { createContext, useState, useContext, ReactNode } from 'react';

// Define the Product type here
type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
  image: string;
};

// Define the context types
interface CartContextProps {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
}

// Create the context
const CartContext = createContext<CartContextProps | undefined>(undefined);

// CartProvider component to wrap the app with the context
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
