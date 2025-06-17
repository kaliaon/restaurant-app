import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";

// Redux Toolkit's configureStore automatically includes 
// thunk middleware by default
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
  // Adding middleware options to handle possible serialization issues
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/logout', 'auth/setUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.role'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

// Define RootState type for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
