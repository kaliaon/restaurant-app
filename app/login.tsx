import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { saveUserToStorage, logoutUser } from "@/store/authSlice";
import styled from "styled-components/native";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Debug current user data on mount
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUserData = await AsyncStorage.getItem("user");
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          console.log("Current user in AsyncStorage:", userData);
          console.log("User role:", userData.role);
        } else {
          console.log("No user found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error checking current user:", error);
      }
    };
    
    checkCurrentUser();
  }, []);

  const handleLogin = async () => {
    try {
      // Get stored users
      const usersJson = await AsyncStorage.getItem("users");
      let users = usersJson ? JSON.parse(usersJson) : [];

      // Find user
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        Alert.alert("Error", "Invalid credentials!");
        return;
      }

      // Ensure user has a role, default to 'user' if not present
      const userWithRole = {
        ...user,
        role: user.role || 'user'
      };
      
      console.log("Logging in user with role:", userWithRole.role);

      // Use the new async action creator instead of separate calls
      dispatch(saveUserToStorage(userWithRole));

      Alert.alert("Success", "Login successful!");
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error logging in:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <Container>
      <Logo source={require("@/assets/images/logo.jpg")} />
      <Input placeholder="Email" onChangeText={setEmail} value={email} />
      <Input placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
      <LoginButton onPress={handleLogin}>
        <LoginText>Login</LoginText>
      </LoginButton>
      <SignupText onPress={() => router.push("/sign-up")}>Don't have an account? Sign up</SignupText>
    </Container>
  );
}

// Styled components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  background-color: white;
`;

const Logo = styled.Image`
  width: 100%;
  height: 120px;
  resize-mode: contain;
  align-self: center;
  margin-bottom: 40px;
`;

const Input = styled.TextInput`
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 16px;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const LoginText = styled.Text`
  color: white;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
`;

const SignupText = styled.Text`
  color: #4ecb71;
  text-align: center;
  font-size: 16px;
  margin-top: 10px;
`;
