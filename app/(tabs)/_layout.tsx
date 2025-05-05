import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  // Get user from Redux store
  const user = useSelector((state: any) => state.auth.user);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First check Redux state
        if (user) {
          console.log("User authenticated from Redux state");
          setIsAuthenticated(true);
          return;
        }
        
        // If no Redux user, check AsyncStorage as fallback
        const storedUserJson = await AsyncStorage.getItem('user');
        if (storedUserJson) {
          console.log("User authenticated from AsyncStorage");
          setIsAuthenticated(true);
          return;
        }
        
        // If we reach here, no user is authenticated
        console.log("No authenticated user found, redirecting to login");
        setIsAuthenticated(false);
        router.replace("/login");
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };
    
    checkAuthentication();
  }, [user, router]);

  // Force immediate check for role on component mount
  useEffect(() => {
    // Explicitly set to false initially
    setIsBusinessOwner(false);
    
    const checkUserRole = async () => {
      try {
        // First check Redux state
        if (user && typeof user === 'object') {
          // Only set to true if role is explicitly 'business_owner'
          if (user.role === 'business_owner') {
            console.log("Setting business owner from Redux:", user.email);
            setIsBusinessOwner(true);
            return; // Exit early if we've determined the role
          } else {
            console.log("User found but not business owner:", user.role);
            setIsBusinessOwner(false);
          }
        }
        
        // If no Redux user or user is not business_owner, check AsyncStorage as fallback
        const storedUserJson = await AsyncStorage.getItem('user');
        if (storedUserJson) {
          try {
            const storedUser = JSON.parse(storedUserJson);
            if (storedUser && typeof storedUser === 'object' && storedUser.role === 'business_owner') {
              console.log("Setting business owner from AsyncStorage:", storedUser.email);
              setIsBusinessOwner(true);
              return;
            } else {
              console.log("Stored user not business owner:", storedUser?.role);
            }
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
          }
        }
        
        // If we reach here, user is not a business owner
        console.log("User is not a business owner");
        setIsBusinessOwner(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsBusinessOwner(false);
      }
    };

    // Run the check
    checkUserRole();
  }, [user]); // Re-run when user changes

  // Ensure the business tab is only shown when isBusinessOwner is truly true (not truthy)
  const showBusinessTab = isBusinessOwner === true;
  
  // Debug log the current state
  console.log("Current user role status:", { 
    isBusinessOwner, 
    userExists: !!user,
    userRole: user?.role || 'no role',
    isAuthenticated
  });

  // If not authenticated, render nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: "Reservation",
          tabBarIcon: ({ color }) => <Ionicons size={28} name="calendar" color={color} />,
        }}
      />
      
      {/* Always include Business tab in router config but hide it completely for non-business users */}
      <Tabs.Screen
        name="business"
        options={{
          title: "Business",
          tabBarIcon: ({ color }) => <Ionicons size={28} name="analytics" color={color} />,
          // This is the key - we use href: null to completely remove it from navigation
          href: showBusinessTab ? undefined : null,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
