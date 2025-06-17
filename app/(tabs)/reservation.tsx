import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Modal, ScrollView, FlatList } from "react-native";
import styled from "styled-components/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// European-focused restaurant data for Astana, Kazakhstan
const restaurants = [
  {
    id: '1',
    name: 'Tuscany Gardens',
    cuisine: 'Italian',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    address: '16 Turan Avenue, Astana'
  },
  {
    id: '2',
    name: 'La Rivière',
    cuisine: 'French',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    address: '23 Kunayev Street, Astana'
  },
  {
    id: '3',
    name: 'Barcelona Tapas',
    cuisine: 'Spanish',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    address: '54 Kabanbay Batyr Avenue, Astana'
  },
  {
    id: '4',
    name: 'Vienna Café',
    cuisine: 'Austrian',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    address: '12 Dostyk Street, Astana'
  },
  {
    id: '5',
    name: 'Santorini',
    cuisine: 'Greek',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1523294587484-bae6cc870010?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    address: '7 Republic Avenue, Astana'
  },
  {
    id: '6',
    name: 'Nordic',
    cuisine: 'Scandinavian',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    address: '36 Syganak Street, Astana'
  },
  {
    id: '7',
    name: 'Assorti',
    cuisine: 'European Fusion',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    address: '45 Saryarka Avenue, Astana'
  }
];

const ReservationScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [numGuests, setNumGuests] = useState("1");
  const [reservations, setReservations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
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

    if (!selectedRestaurant) {
      Alert.alert("Error", "Please select a restaurant.");
      return;
    }

    const newReservation = {
      id: new Date().toISOString(),
      date: date.toLocaleString(),
      guests: numGuests,
      restaurant: selectedRestaurant,
    };

    const updatedReservations = [...reservations, newReservation];
    setReservations(updatedReservations);
    await AsyncStorage.setItem("reservations", JSON.stringify(updatedReservations));

    setModalVisible(true); // Show confirmation modal
  };

  const renderRestaurantItem = ({ item }) => (
    <RestaurantCard 
      selected={selectedRestaurant && selectedRestaurant.id === item.id}
      onPress={() => setSelectedRestaurant(item)}
    >
      <RestaurantImage source={{ uri: item.image }} />
      <RestaurantInfo>
        <RestaurantName>{item.name}</RestaurantName>
        <RestaurantDetails>
          <Ionicons name="restaurant-outline" size={16} color="gray" />
          <DetailText>{item.cuisine}</DetailText>
        </RestaurantDetails>
        <RestaurantDetails>
          <Ionicons name="star" size={16} color="#FFD700" />
          <DetailText>{item.rating}</DetailText>
        </RestaurantDetails>
        <RestaurantDetails>
          <Ionicons name="location-outline" size={16} color="gray" />
          <DetailText numberOfLines={1}>{item.address}</DetailText>
        </RestaurantDetails>
      </RestaurantInfo>
      {selectedRestaurant && selectedRestaurant.id === item.id && (
        <SelectedIndicator>
          <Ionicons name="checkmark-circle" size={24} color="white" />
        </SelectedIndicator>
      )}
    </RestaurantCard>
  );

  return (
    <Container>
      <Header>
        <Title>Reserve Your Table</Title>
        <Ionicons name="restaurant" size={28} color="#4ECb71" />
      </Header>

      <Label>Select Restaurant</Label>
      <RestaurantList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

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
              {selectedRestaurant && `${selectedRestaurant.name}`}
            </ModalSubText>
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
  margin-top: 15px;
  margin-bottom: 8px;
  color: #555;
`;

const RestaurantList = styled(FlatList)`
  margin-bottom: 5px;
`;

const RestaurantCard = styled.TouchableOpacity<{ selected: boolean }>`
  width: 220px;
  height: 220px;
  margin-right: 12px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border-width: ${props => props.selected ? '3px' : '1px'};
  border-color: ${props => props.selected ? '#4ECb71' : '#ddd'};
`;

const RestaurantImage = styled.Image`
  width: 100%;
  height: 120px;
`;

const RestaurantInfo = styled.View`
  padding: 10px;
`;

const RestaurantName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const RestaurantDetails = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 3px;
`;

const DetailText = styled.Text`
  font-size: 14px;
  color: #666;
  margin-left: 5px;
`;

const SelectedIndicator = styled.View`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: #4ECb71;
  align-items: center;
  justify-content: center;
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
