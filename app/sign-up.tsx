import React, { useState } from "react";
import { Alert, View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { saveUserToStorage } from "@/store/authSlice";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'user' | 'business_owner'>('user');

  const handleSignUp = async () => {
    try {
      // Basic validation
      if (!email || !password || !name) {
        Alert.alert("Error", "Please fill in all required fields!");
        return;
      }

      // Get stored users
      const usersJson = await AsyncStorage.getItem("users");
      let users = usersJson ? JSON.parse(usersJson) : [];

      // Check if user already exists
      const userExists = users.find((user: any) => user.email === email);
      if (userExists) {
        Alert.alert("Error", "Email already registered!");
        return;
      }

      // Add new user with role
      const newUser = { 
        email, 
        password, 
        phone, 
        name, 
        role: role || 'user' // Ensure role is explicitly set
      };
      
      console.log("Creating new user with role:", newUser.role);
      
      // Save to users list
      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));

      // Use the saveUserToStorage action creator
      dispatch(saveUserToStorage(newUser));

      Alert.alert("Success", "Account created!");
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Container>
        <Logo source={require("@/assets/images/logo.jpg")} />
        <Title>Create Account</Title>
        
        <InputLabel>Name *</InputLabel>
        <Input placeholder="Enter your name" onChangeText={setName} value={name} />
        
        <InputLabel>Email *</InputLabel>
        <Input placeholder="Enter your email" onChangeText={setEmail} value={email} keyboardType="email-address" />
        
        <InputLabel>Password *</InputLabel>
        <Input placeholder="Create a password" secureTextEntry onChangeText={setPassword} value={password} />
        
        <InputLabel>Phone</InputLabel>
        <Input placeholder="Enter your phone number" onChangeText={setPhone} value={phone} keyboardType="phone-pad" />
        
        <InputLabel>Account Type</InputLabel>
        <RoleSelector>
          <RoleOption 
            selected={role === 'user'} 
            onPress={() => setRole('user')}
          >
            <RoleOptionText selected={role === 'user'}>Regular User</RoleOptionText>
          </RoleOption>
          
          <RoleOption 
            selected={role === 'business_owner'} 
            onPress={() => setRole('business_owner')}
          >
            <RoleOptionText selected={role === 'business_owner'}>Business Owner</RoleOptionText>
          </RoleOption>
        </RoleSelector>
        {role === 'business_owner' && (
          <RoleInfo>
            <Ionicons name="information-circle-outline" size={16} color="#4ecb71" />
            <RoleInfoText>You'll get access to the business dashboard and analytics.</RoleInfoText>
          </RoleInfo>
        )}
        
        <SignUpButton onPress={handleSignUp}>
          <SignUpButtonText>Create Account</SignUpButtonText>
        </SignUpButton>
        
        <LoginLink onPress={() => router.push("/login")}>
          Already have an account? Login
        </LoginLink>
      </Container>
    </ScrollView>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
`;

const Logo = styled.Image`
  width: 100%;
  height: 120px;
  resize-mode: contain;
  align-self: center;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  color: #555;
  margin-bottom: 5px;
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

const RoleSelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const RoleOption = styled.TouchableOpacity<{ selected: boolean }>`
  flex: 1;
  background-color: ${props => props.selected ? '#4ecb71' : '#f0f0f0'};
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin: 0 5px;
`;

const RoleOptionText = styled.Text<{ selected: boolean }>`
  color: ${props => props.selected ? 'white' : '#555'};
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
`;

const RoleInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(78, 203, 113, 0.1);
  border-radius: 5px;
`;

const RoleInfoText = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  color: #555;
`;

const SignUpButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin-top: 10px;
  margin-bottom: 15px;
`;

const SignUpButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const LoginLink = styled.Text`
  color: #4ecb71;
  text-align: center;
  font-size: 16px;
  margin-top: 10px;
`;
