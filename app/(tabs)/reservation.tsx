import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Modal } from "react-native";
import styled from "styled-components/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ReservationScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [numGuests, setNumGuests] = useState("1");
  const [reservations, setReservations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadReservations = async () => {
      const savedReservations = await AsyncStorage.getItem("reservations");
      if (savedReservations) {
        setReservations(JSON.parse(savedReservations));
      }
    };
    loadReservations();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Hide the picker after selecting
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleConfirmReservation = async () => {
    if (!numGuests || parseInt(numGuests) <= 0) {
      Alert.alert("Error", "Please enter a valid number of guests.");
      return;
    }

    const newReservation = {
      id: new Date().toISOString(),
      date: date.toLocaleString(),
      guests: numGuests,
    };

    const updatedReservations = [...reservations, newReservation];
    setReservations(updatedReservations);
    await AsyncStorage.setItem("reservations", JSON.stringify(updatedReservations));

    setModalVisible(true); // Show confirmation modal
  };

  return (
    <Container>
      <Header>
        <Title>Reserve Your Table</Title>
        <Ionicons name="restaurant" size={28} color="#4ECb71" />
      </Header>

      <Label>Select Date & Time</Label>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <DateInput>
          <Ionicons name="calendar-outline" size={20} color="gray" />
          <Text style={{ fontSize: 16, marginLeft: 8 }}>{date.toLocaleString()}</Text>
        </DateInput>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          is24Hour={true}
          onChange={handleDateChange}
        />
      )}

      <Label>Number of Guests</Label>
      <InputContainer>
        <Ionicons name="people-outline" size={20} color="gray" />
        <GuestInput
          value={numGuests}
          onChangeText={setNumGuests}
          keyboardType="numeric"
          placeholder="Enter number of guests"
        />
      </InputContainer>

      <ConfirmButton onPress={handleConfirmReservation}>
        <ButtonText>Confirm Reservation</ButtonText>
      </ConfirmButton>

      <ViewReservationsButton onPress={() => router.push("/reservations-history")}>
        <ButtonText>View My Reservations</ButtonText>
      </ViewReservationsButton>

      {/* Modal for Confirmation */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <ModalContainer>
          <ModalContent>
            <Ionicons name="checkmark-circle" size={50} color="#4ECb71" />
            <ModalText>Reservation Confirmed! 🎉</ModalText>
            <ModalSubText>
              Your table is booked for {date.toLocaleString()} for {numGuests} guests.
            </ModalSubText>
            <CloseButton onPress={() => setModalVisible(false)}>
              <ButtonText>Close</ButtonText>
            </CloseButton>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </Container>
  );
};

export default ReservationScreen;

// Styled Components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const Label = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
  color: #555;
`;

const DateInput = styled.View`
  flex-direction: row;
  align-items: center;
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding: 10px;
  margin-top: 5px;
  background-color: #f9f9f9;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding: 10px;
  margin-top: 5px;
  background-color: #f9f9f9;
`;

const GuestInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  margin-left: 10px;
`;

const ConfirmButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin-top: 20px;
`;

const ViewReservationsButton = styled.TouchableOpacity`
  background-color: #007bff;
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

// Modal Styles
const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  align-items: center;
`;

const ModalText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
  color: #333;
`;

const ModalSubText = styled.Text`
  font-size: 16px;
  text-align: center;
  margin-top: 10px;
  color: #666;
`;

const CloseButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  width: 100%;
  align-items: center;
`;
