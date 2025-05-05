import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id?: string;
  email: string;
  role: 'user' | 'business_owner';
  name?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export const saveUserToStorage = (user: User) => async (dispatch: any) => {
  try {
    dispatch(setUser(user));
    await AsyncStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user to AsyncStorage:", error);
  }
};

export const logoutUser = () => async (dispatch: any) => {
  try {
    dispatch(logout());
    await AsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Error removing user from AsyncStorage:", error);
  }
};

export default authSlice.reducer;
