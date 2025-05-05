import React, { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import styled from "styled-components/native";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      // Save user session
      await AsyncStorage.setItem("user", JSON.stringify(user));
      dispatch(setUser(user));

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

// Styled Components
const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #ffffff;
`;

const Logo = styled.Image`
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
`;

const Input = styled.TextInput`
  width: 90%;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  background-color: #f2f2f2;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  width: 90%;
  align-items: center;
  border-radius: 10px;
  margin-top: 10px;
`;

const LoginText = styled.Text`
  color: white;
  font-weight: bold;
`;

const SignupText = styled.Text`
  margin-top: 10px;
  color: #4a90e2;
  text-decoration: underline;
`;
