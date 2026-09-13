import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pizzaverse_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pizzaverse_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem) => {
    setItems((prevItems) => {
      // If it's a menu pizza without custom alterations, check for existing
      if (!newItem.isCustom) {
        const existingIndex = prevItems.findIndex(
          (i) => !i.isCustom && i.pizzaId === newItem.pizzaId
        );
        if (existingIndex > -1) {
          const updated = [...prevItems];
          const item = updated[existingIndex];
          item.quantity += newItem.quantity || 1;
          item.totalPrice = item.quantity * item.unitPrice;
          return updated;
        }
      }

      // Otherwise add as distinct item
      const cartItemId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return [
        ...prevItems,
        {
          ...newItem,
          cartItemId,
          quantity: newItem.quantity || 1,
          totalPrice: (newItem.quantity || 1) * newItem.unitPrice,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.cartItemId === cartItemId) {
          return {
            ...i,
            quantity: newQty,
            totalPrice: newQty * i.unitPrice,
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        subtotal,
        deliveryFee,
        tax,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
