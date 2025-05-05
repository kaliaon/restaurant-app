import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ReservationHistoryScreen() {
  const [reservations, setReservations] = useState([]);
  const [deletedReservation, setDeletedReservation] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const savedReservations = await AsyncStorage.getItem("reservations");
      if (savedReservations) {
        setReservations(JSON.parse(savedReservations));
      }
    };
    fetchReservations();
  }, []);

  const handleCancelReservation = async (id) => {
    const filteredReservations = reservations.filter((res) => res.id !== id);
    const deleted = reservations.find((res) => res.id === id);

    setReservations(filteredReservations);
    setDeletedReservation(deleted);

    const timeout = setTimeout(async () => {
      await AsyncStorage.setItem("reservations", JSON.stringify(filteredReservations));
      setDeletedReservation(null);
    }, 5000);

    setUndoTimeout(timeout);
  };

  const handleUndoCancel = () => {
    if (deletedReservation) {
      setReservations([...reservations, deletedReservation]);
      clearTimeout(undoTimeout);
      setDeletedReservation(null);
    }
  };

  return (
    <Container>
      <Header>
        <Title>My Reservations</Title>
        <Ionicons name="calendar" size={28} color="#4ECb71" />
      </Header>

      {reservations.length === 0 ? (
        <EmptyText>No reservations found.</EmptyText>
      ) : (
        <ListContainer>
          <FlatList
            data={reservations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReservationCard>
                <ReservationDetails>
                  <Ionicons name="time-outline" size={20} color="gray" />
                  <Text style={{ fontSize: 16, fontWeight: "bold", marginLeft: 5 }}>
                    {item.date}
                  </Text>
                  <Ionicons name="people-outline" size={20} color="gray" style={{ marginLeft: 10 }} />
                  <Text> {item.guests} Guests</Text>
                </ReservationDetails>
                <CancelButton onPress={() => handleCancelReservation(item.id)}>
                  <Ionicons name="trash" size={20} color="white" />
                </CancelButton>
              </ReservationCard>
            )}
          />
        </ListContainer>
      )}

      {deletedReservation && (
        <UndoContainer>
          <UndoText>Reservation cancelled</UndoText>
          <UndoButton onPress={handleUndoCancel}>
            <UndoText style={{ color: "#007bff" }}>Undo</UndoText>
          </UndoButton>
        </UndoContainer>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
`;

const ListContainer = styled.View`
  flex: 1;
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

const ReservationCard = styled.View`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  elevation: 2;
`;

const ReservationDetails = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CancelButton = styled.TouchableOpacity`
  background-color: red;
  padding: 10px;
  border-radius: 5px;
`;

const EmptyText = styled.Text`
  font-size: 18px;
  text-align: center;
  margin-top: 50px;
  color: gray;
`;

const UndoContainer = styled.View`
  background-color: #f9f9f9;
  padding: 10px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  border-radius: 5px;
`;

const UndoText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: gray;
`;

const UndoButton = styled.TouchableOpacity`
  padding: 5px;
`;
