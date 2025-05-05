import React, { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import styled from "styled-components/native";

export default function SignUpScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleSignUp = async () => {
    try {
      // Get stored users
      const usersJson = await AsyncStorage.getItem("users");
      let users = usersJson ? JSON.parse(usersJson) : [];

      // Check if user already exists
      const userExists = users.find((user: any) => user.email === email);
      if (userExists) {
        Alert.alert("Error", "Email already registered!");
        return;
      }

      // Add new user
      const newUser = { email, password, phone, name };
      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));

      // Save user session
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      dispatch(setUser(newUser));

      Alert.alert("Success", "Account created!");
      router.push("/login");
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <Container>
      <Logo source={require("@/assets/images/logo.jpg")} />
      <Input placeholder="Email" onChangeText={setEmail} value={email} />
      <Input placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
      <Input placeholder="Phone" keyboardType="phone-pad" onChangeText={setPhone} value={phone} />
      <Input placeholder="Name" onChangeText={setName} value={name} />
      <SignUpButton onPress={handleSignUp}>
        <SignUpText>Sign Up</SignUpText>
      </SignUpButton>
      <LoginText onPress={() => router.push("/login")}>Have an account? Log in</LoginText>
      <SocialIconsContainer>
        <SocialIcon source={require("@/assets/images/google.png")} />
        <SocialIcon source={require("@/assets/images/facebook.png")} />
      </SocialIconsContainer>
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

const SignUpButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  width: 90%;
  align-items: center;
  border-radius: 10px;
  margin-top: 10px;
`;

const SignUpText = styled.Text`
  color: white;
  font-weight: bold;
`;

const LoginText = styled.Text`
  margin-top: 10px;
  color: #4a90e2;
  text-decoration: underline;
`;

const SocialIconsContainer = styled.View`
  flex-direction: row;
  margin-top: 20px;
`;

const SocialIcon = styled.Image`
  width: 40px;
  height: 40px;
  margin: 5px;
`;
