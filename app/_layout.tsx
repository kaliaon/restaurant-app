import { Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
