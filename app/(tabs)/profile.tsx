import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setName(userData.name || "John Doe");
        setEmail(userData.email || "johndoe@example.com");
        setPhone(userData.phone || "+1 234 567 890");
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const userData = { name, email, phone };
    await AsyncStorage.setItem("userProfile", JSON.stringify(userData));
    setIsEditing(false);
    Alert.alert("Success", "Profile updated!");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userProfile");
    Alert.alert("Logged Out", "You have been logged out.");
    router.push("/login"); // Redirect to login page
  };

  return (
    <Container>
      <Header>
        <Avatar source={{ uri: "https://www.w3schools.com/howto/img_avatar.png" }} />
        <Title>{name}</Title>
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <EditIcon>
            <Ionicons name="pencil-outline" size={20} color="white" />
          </EditIcon>
        </TouchableOpacity>
      </Header>

      {isEditing ? (
        <>
          <InputLabel>Name</InputLabel>
          <Input value={name} onChangeText={setName} placeholder="Enter your name" />

          <InputLabel>Email</InputLabel>
          <Input value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" />

          <InputLabel>Phone</InputLabel>
          <Input value={phone} onChangeText={setPhone} placeholder="Enter your phone" keyboardType="phone-pad" />

          <SaveButton onPress={handleSave}>
            <ButtonText>Save Changes</ButtonText>
          </SaveButton>
        </>
      ) : (
        <UserInfoContainer>
          <UserInfoRow>
            <Ionicons name="mail-outline" size={20} color="gray" />
            <UserInfoText>{email}</UserInfoText>
          </UserInfoRow>
          <UserInfoRow>
            <Ionicons name="call-outline" size={20} color="gray" />
            <UserInfoText>{phone}</UserInfoText>
          </UserInfoRow>
        </UserInfoContainer>
      )}

      <LogoutButton onPress={handleLogout}>
        <ButtonText>Logout</ButtonText>
      </LogoutButton>
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
`;

const Header = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  margin-bottom: 10px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
`;

const EditIcon = styled.View`
  background-color: #4ecb71;
  padding: 8px;
  border-radius: 50px;
  margin-top: 10px;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
  color: #555;
`;

const Input = styled.TextInput`
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding: 10px;
  margin-top: 5px;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin-top: 20px;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: red;
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

const UserInfoContainer = styled.View`
  margin-top: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
`;

const UserInfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const UserInfoText = styled.Text`
  font-size: 16px;
  margin-left: 10px;
  color: #333;
`;
