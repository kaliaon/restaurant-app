import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image, Modal, ScrollView } from "react-native";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, saveUserToStorage } from "@/store/authSlice";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [issueType, setIssueType] = useState("General");
  const [issueDescription, setIssueDescription] = useState("");
  const [submittedIssues, setSubmittedIssues] = useState<Array<{type: string, description: string, date: string}>>([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Use data from Redux store if available
        setName(user.name || "John Doe");
        setEmail(user.email || "johndoe@example.com");
        setPhone(user.phone || "+1 234 567 890");
        setRole(user.role || "user");
      } else {
        // Fallback to AsyncStorage
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setName(userData.name || "John Doe");
          setEmail(userData.email || "johndoe@example.com");
          setPhone(userData.phone || "+1 234 567 890");
          setRole(userData.role || "user");
        }
      }
      
      // Load previously submitted issues
      const savedIssues = await AsyncStorage.getItem("submittedIssues");
      if (savedIssues) {
        setSubmittedIssues(JSON.parse(savedIssues));
      }
    };
    loadUserData();
  }, [user]);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const updatedUser = { 
      ...user, 
      name, 
      email, 
      phone,
      role: user?.role || role || 'user' // Ensure role is preserved
    };
    
    // Update the user using the saveUserToStorage action
    dispatch(saveUserToStorage(updatedUser));
    setIsEditing(false);
    Alert.alert("Success", "Profile updated!");
  };

  const handleLogout = async () => {
    // Use the logoutUser async action instead
    dispatch(logoutUser());
    Alert.alert("Logged Out", "You have been logged out.");
    router.push("/login"); // Redirect to login page
  };

  const handleSubmitIssue = async () => {
    if (!issueDescription.trim()) {
      Alert.alert("Error", "Please describe your issue");
      return;
    }

    const newIssue = {
      type: issueType,
      description: issueDescription,
      date: new Date().toLocaleString()
    };

    const updatedIssues = [...submittedIssues, newIssue];
    setSubmittedIssues(updatedIssues);
    
    // Store issues in AsyncStorage (temporary until backend implementation)
    await AsyncStorage.setItem("submittedIssues", JSON.stringify(updatedIssues));
    
    setIssueDescription("");
    setIssueType("General");
    setHelpModalVisible(false);
    
    Alert.alert("Success", "Your issue has been submitted. We'll get back to you soon!");
  };

  return (
    <Container>
      <Header>
        <AvatarContainer>
          <Avatar source={{ uri: "https://www.w3schools.com/howto/img_avatar.png" }} />
          <EditIconButton onPress={() => setIsEditing(true)}>
            <EditIcon>
              <Ionicons name="pencil-outline" size={20} color="white" />
            </EditIcon>
          </EditIconButton>
        </AvatarContainer>
        <Title>{name}</Title>
        <AccountType>{role === 'business_owner' ? 'Business Owner' : 'Customer'}</AccountType>
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
          {role === 'business_owner' && (
            <UserInfoRow>
              <Ionicons name="briefcase-outline" size={20} color="gray" />
              <UserInfoText>Business Account</UserInfoText>
            </UserInfoRow>
          )}
        </UserInfoContainer>
      )}

      {/* Help Section */}
      <SectionTitle>Support</SectionTitle>
      <HelpButton onPress={() => setHelpModalVisible(true)}>
        <Ionicons name="help-circle-outline" size={24} color="white" style={{ marginRight: 10 }} />
        <ButtonText>Get Help</ButtonText>
      </HelpButton>

      {submittedIssues.length > 0 && (
        <>
          <SectionTitle>Your Previous Inquiries</SectionTitle>
          <ScrollView style={{ maxHeight: 200 }}>
            {submittedIssues.map((issue, index) => (
              <IssueCard key={index}>
                <IssueType>{issue.type}</IssueType>
                <IssueText>{issue.description}</IssueText>
                <IssueDate>{issue.date}</IssueDate>
              </IssueCard>
            ))}
          </ScrollView>
        </>
      )}

      <LogoutButton onPress={handleLogout}>
        <ButtonText>Logout</ButtonText>
      </LogoutButton>

      {/* Help Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Get Help</ModalTitle>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </ModalHeader>

            <InputLabel>Issue Type</InputLabel>
            <IssueTypeContainer>
              {["General", "Order", "Payment", "Reservation", "App Issue"].map((type) => (
                <IssueTypeButton 
                  key={type} 
                  selected={type === issueType}
                  onPress={() => setIssueType(type)}
                >
                  <IssueTypeText selected={type === issueType}>{type}</IssueTypeText>
                </IssueTypeButton>
              ))}
            </IssueTypeContainer>

            <InputLabel>Describe Your Issue</InputLabel>
            <DescriptionInput
              value={issueDescription}
              onChangeText={setIssueDescription}
              placeholder="Please provide details about your issue..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <SubmitButton onPress={handleSubmitIssue}>
              <ButtonText>Submit</ButtonText>
            </SubmitButton>
          </ModalContent>
        </ModalOverlay>
      </Modal>
      
      <FooterText>Restaurant App © 2023. All rights reserved.</FooterText>
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  padding-top: 60px;
`;

const Header = styled.View`
  align-items: center;
  margin-bottom: 30px;
`;

const AvatarContainer = styled.View`
  position: relative;
  margin-bottom: 10px;
`;

const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const EditIconButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 0;
  right: 0;
  zIndex: 10;
`;

const EditIcon = styled.View`
  background-color: #4ecb71;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const AccountType = styled.Text`
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 10px;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 5px;
`;

const Input = styled.TextInput`
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 10px;
  font-size: 16px;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  margin-top: 20px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

const UserInfoContainer = styled.View`
  margin-top: 20px;
`;

const UserInfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const UserInfoText = styled.Text`
  font-size: 16px;
  margin-left: 10px;
  color: #2c3e50;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: #e74c3c;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  margin-top: 30px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-top: 25px;
  margin-bottom: 10px;
`;

const HelpButton = styled.TouchableOpacity`
  background-color: #3498db;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: white;
  width: 90%;
  padding: 20px;
  border-radius: 15px;
  max-height: 80%;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ModalTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
`;

const IssueTypeContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const IssueTypeButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding: 8px 12px;
  border-radius: 20px;
  background-color: ${props => props.selected ? '#3498db' : '#f5f5f5'};
  margin-right: 8px;
  margin-bottom: 8px;
`;

const IssueTypeText = styled.Text<{ selected: boolean }>`
  color: ${props => props.selected ? 'white' : '#333'};
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
`;

const DescriptionInput = styled.TextInput`
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 10px;
  font-size: 16px;
  min-height: 120px;
`;

const SubmitButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  margin-top: 20px;
`;

const IssueCard = styled.View`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  border-left-width: 4px;
  border-left-color: #3498db;
`;

const IssueType = styled.Text`
  font-weight: bold;
  font-size: 16px;
  color: #3498db;
  margin-bottom: 5px;
`;

const IssueText = styled.Text`
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
`;

const IssueDate = styled.Text`
  font-size: 12px;
  color: #7f8c8d;
  text-align: right;
`;

const FooterText = styled.Text`
  text-align: center;
  color: #95a5a6;
  font-size: 12px;
  margin-top: auto;
  padding-top: 20px;
  padding-bottom: 10px;
`;
