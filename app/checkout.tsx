import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import styled from "styled-components/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { useRouter } from "expo-router";
import { saveOrderHistory } from "@/store/cartSlice";


export default function CheckoutScreen() {
  const [cartItems, setCartItems] = useState([]);
  const reduxCartItems = useSelector((state: RootState) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    setCartItems(reduxCartItems); // Ensure cart data updates when Redux state changes
  }, [reduxCartItems]);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Your cart is empty!");
      return;
    }
  
    dispatch(saveOrderHistory()); // Save order to history
    Alert.alert("Order Confirmed!", `Your order has been placed successfully.`);
  
    router.push("/order-history"); // Navigate to Order History page
  };

  return (
    <Container>
      <Header>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Checkout</Text>
      </Header>

      {/* Order Summary */}
      <SectionTitle>Order Summary</SectionTitle>
      {cartItems.length === 0 ? (
        <EmptyCartText>Your cart is empty.</EmptyCartText>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CartItem>
              <ItemImage source={{ uri: item.image }} />
              <ItemDetails>
                <ItemName>{item.name}</ItemName>
                <ItemPrice>{item.price * item.quantity} ₸</ItemPrice>
                <QuantityText>Quantity: {item.quantity}</QuantityText>
              </ItemDetails>
            </CartItem>
          )}
        />
      )}

      {/* Payment Method Selection */}
      <SectionTitle>Payment Method</SectionTitle>
      <PaymentContainer>
        <PaymentButton selected={paymentMethod === "Cash"} onPress={() => setPaymentMethod("Cash")}>
          <PaymentText selected={paymentMethod === "Cash"}>Cash</PaymentText>
        </PaymentButton>
        <PaymentButton selected={paymentMethod === "Card"} onPress={() => setPaymentMethod("Card")}>
          <PaymentText selected={paymentMethod === "Card"}>Card</PaymentText>
        </PaymentButton>
      </PaymentContainer>

      <TotalPrice>Total: {getTotalPrice()} ₸</TotalPrice>
      <ConfirmOrderButton onPress={handleConfirmOrder}>
        <ButtonText>Confirm Order</ButtonText>
      </ConfirmOrderButton>
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

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const CartItem = styled.View`
  flex-direction: row;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  align-items: center;
`;

const ItemImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 10px;
`;

const ItemDetails = styled.View`
  flex: 1;
  padding: 10px;
`;

const ItemName = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const ItemPrice = styled.Text`
  font-size: 16px;
  color: #4ecb71;
`;

const QuantityText = styled.Text`
  font-size: 16px;
  color: gray;
`;

const PaymentContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const PaymentButton = styled.TouchableOpacity`
  flex: 1;
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  background-color: ${({ selected }) => (selected ? "#4ecb71" : "#f0f0f0")};
  margin: 0 5px;
`;

const PaymentText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ selected }) => (selected ? "white" : "black")};
`;

const TotalPrice = styled.Text`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
`;

const ConfirmOrderButton = styled.TouchableOpacity`
  background-color: #4ecb71;
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

const EmptyCartText = styled.Text`
  font-size: 18px;
  text-align: center;
  margin-top: 50px;
  color: gray;
`;