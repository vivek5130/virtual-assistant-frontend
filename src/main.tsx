import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import Header from './components/shop/Header';
import Footer from './components/shop/Footer';
import AssistantEmbed from './components/shop/AssistantEmbed';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Orders, { OrderDetail, Track } from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Auth from './pages/Auth';
import AdminLayout from './components/admin/AdminLayout';
import AdminOrders from './pages/admin/Orders';
import { ProductEditor, ProductsList } from './pages/admin/Products';
import Storefront from './pages/admin/Storefront';
import Assistant from './pages/admin/Assistant';

function StoreLayout() {
  const { pathname } = useLocation();
  const { toast } = useCart();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <AssistantEmbed />
      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-ink bg-yellow px-4 py-2 text-sm font-semibold shadow-sticker">
          {toast}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="collections/:handle" element={<Shop />} />
              <Route path="p/:slug" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderNumber" element={<OrderDetail />} />
              <Route path="track" element={<Track />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="login" element={<Auth mode="login" />} />
              <Route path="register" element={<Auth mode="register" />} />
              <Route path="*" element={<p className="py-24 text-center font-display text-3xl font-bold">This aisle doesn't exist.</p>} />
            </Route>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="products" replace />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/:id" element={<ProductEditor />} />
              <Route path="storefront" element={<Storefront />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="assistant" element={<Assistant />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>
);
