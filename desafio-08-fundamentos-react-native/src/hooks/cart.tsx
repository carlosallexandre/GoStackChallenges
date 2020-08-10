import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

export interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const STORAGE_KEY = React.useMemo(() => '@GoMarketplace_products', []);

  useEffect(() => {
    (async () => {
      const cartProducts = await AsyncStorage.getItem(STORAGE_KEY);

      if (cartProducts) setProducts(JSON.parse(cartProducts));
    })();
  }, [STORAGE_KEY]);

  const saveProducts = useCallback(
    async (value: Product[]): Promise<void> => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },
    [STORAGE_KEY],
  );
  const addToCart = useCallback(
    async product => {
      saveProducts([...products, { ...product, quantity: 1 }]);
      setProducts([...products, { ...product, quantity: 1 }]);
    },
    [saveProducts, products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex < 0) return;

      const draftProducts = [...products];
      draftProducts[productIndex].quantity += 1;

      saveProducts(draftProducts);
      setProducts(draftProducts);
    },
    [saveProducts, products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex < 0) return;

      let draftProducts = [...products];

      if (draftProducts[productIndex].quantity > 0) {
        draftProducts[productIndex].quantity -= 1;
      } else {
        draftProducts = draftProducts.filter(product => product.id !== id);
      }

      saveProducts(draftProducts);
      setProducts(draftProducts);
    },
    [saveProducts, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
