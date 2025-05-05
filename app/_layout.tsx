import { Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "@/store/authSlice";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize auth state in component lifecycle
  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        // Reset auth state to ensure clean start
        store.dispatch({ type: "auth/logout" });
        
        // Check if user is already logged in
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          try {
            // Parse user data
            const user = JSON.parse(userData);
            
            // Log what we're loading
            console.log("Initializing with stored user:", user.email, "Role:", user.role || 'no role');
            
            // Ensure user has a role property
            if (!user.role) {
              user.role = 'user'; // Default role
              console.log("No role found, defaulting to: user");
              // Update storage with role added
              await AsyncStorage.setItem("user", JSON.stringify(user));
            }
            
            // Dispatch to store
            store.dispatch(setUser(user));
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            // Clear invalid data
            await AsyncStorage.removeItem("user");
          }
        } else {
          console.log("No stored user found during initialization");
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
      }
    };

    // Initialize auth state when component mounts
    initializeAuthState();
  }, []);  // Empty dependency array ensures it only runs once on mount

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Tabs Navigation - Main App Screens */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Auth Screens */}
          <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />

          {/* Pages Accessible from Tabs */}
          <Stack.Screen name="cart" options={{ title: "Cart" }} />
          <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
          <Stack.Screen name="order-history" options={{ title: "Order History" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="food-details" options={{ title: "Food Details" }} />
          <Stack.Screen name="reservation" options={{ title: "Reservation" }} />
          <Stack.Screen name="reservations-history" options={{ title: "Reservations History" }} />
          <Stack.Screen name="voice-order" options={{ title: "Voice Order" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
