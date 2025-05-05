import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import styled from "styled-components/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addToCart, loadOrderHistory } from "@/store/cartSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function OrderHistoryScreen() {
  const orderHistory = useSelector((state: RootState) => state.cart.orderHistory);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const savedOrders = await AsyncStorage.getItem("orderHistory");
      if (savedOrders) {
        dispatch(loadOrderHistory(JSON.parse(savedOrders)));
      }
      setLoading(false);
    };
    fetchOrderHistory();
  }, []);

  const handleReorder = (items) => {
    items.forEach((item) => {
      dispatch(addToCart(item));
    });
    Alert.alert("Reorder Successful!", "Items have been added to your cart.");
    router.push("/cart");
  };

  return (
    <Container>
      <Header>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Order History</Text>
      </Header>

      {orderHistory.length === 0 ? (
        <EmptyText>No past orders available.</EmptyText>
      ) : (
        <FlatList
          data={orderHistory}
          keyExtractor={(order) => order.id}
          renderItem={({ item }) => (
            <OrderCard>
              <OrderHeader>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>Order on {item.date}</Text>
                <Text>Total: {item.total} ₸</Text>
              </OrderHeader>
              {item.items.map((food, index) => (
                <FoodItem key={index}>
                  <FoodImage source={{ uri: food.image }} />
                  <FoodDetails>
                    <Text>{food.name}</Text>
                    <Text>Qty: {food.quantity}</Text>
                    <Text>{food.price * food.quantity} ₸</Text>
                  </FoodDetails>
                </FoodItem>
              ))}
              <ReorderButton onPress={() => handleReorder(item.items)}>
                <ButtonText>Reorder</ButtonText>
              </ReorderButton>
            </OrderCard>
          )}
        />
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

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const OrderCard = styled.View`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
`;

const OrderHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const FoodItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
`;

const FoodImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 10px;
`;

const FoodDetails = styled.View`
  flex: 1;
  padding-left: 10px;
`;

const ReorderButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 10px;
  align-items: center;
  border-radius: 5px;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

const EmptyText = styled.Text`
  font-size: 18px;
  text-align: center;
  margin-top: 50px;
  color: gray;
`;
