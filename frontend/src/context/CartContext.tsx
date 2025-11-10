import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  farmerId: string;
  farmerName: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('agriconnect_cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('agriconnect_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, quantity: number) => {
    setItems(current => {
      const existingItem = current.find(item => item.productId === (product._id || product.id));

      if (existingItem) {
        return current.map(item =>
          item.productId === (product._id || product.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, {
        id: Date.now().toString(),
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity,
        unit: product.unit,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        image: product.image
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(current => current.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(current =>
      current.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}