import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  
  // Wrap the app with CartProvider to provide the global cart state
  
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        {/* You can add more routes here if needed */}
        {/* <Route path="/product/:id" element={<ProductDetails />} /> */}
        {/* <Route path="/cart" element={<CartPage />} /> */}
      </Routes>
    </Router>
 
);
