import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
}

interface CartState {
  cartItems: CartItem[];
  orderHistory: Order[];
}

const initialState: CartState = {
  cartItems: [],
  orderHistory: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cartItems.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 });
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
    },

    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
    },

    saveOrderHistory: (state) => {
      if (state.cartItems.length === 0) return;

      const newOrder: Order = {
        id: new Date().toISOString(),
        items: [...state.cartItems],
        total: state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toLocaleString(),
      };

      state.orderHistory.push(newOrder);
      AsyncStorage.setItem("orderHistory", JSON.stringify(state.orderHistory));
      state.cartItems = [];
    },

    loadOrderHistory: (state, action: PayloadAction<Order[]>) => {
      state.orderHistory = action.payload;
    }
  },
});

// ✅ Export all actions properly
export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, saveOrderHistory, loadOrderHistory } = cartSlice.actions;
export default cartSlice.reducer;
