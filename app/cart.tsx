import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import styled from "styled-components/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, increaseQuantity, decreaseQuantity, clearCart } from "@/store/cartSlice";
import { useRouter } from "expo-router";

export default function CartScreen() {
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Your cart is empty!");
      return;
    }
    Alert.alert("Success!", "Your order has been placed.");
    // dispatch(clearCart());
    router.push("/checkout");
  };

  return (
    <Container>
      <Header>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Your Cart</Text>
      </Header>

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
                <QuantityContainer>
                  <QuantityButton onPress={() => dispatch(decreaseQuantity(item.id))}>
                    <ButtonText>-</ButtonText>
                  </QuantityButton>
                  <QuantityText>{item.quantity}</QuantityText>
                  <QuantityButton onPress={() => dispatch(increaseQuantity(item.id))}>
                    <ButtonText>+</ButtonText>
                  </QuantityButton>
                </QuantityContainer>
              </ItemDetails>
              <RemoveButton onPress={() => dispatch(removeFromCart(item.id))}>
                <ButtonText>X</ButtonText>
              </RemoveButton>
            </CartItem>
          )}
        />
      )}

      <TotalPrice>Total: {getTotalPrice()} ₸</TotalPrice>
      <CheckoutButton onPress={handleCheckout}>
        <ButtonText>Proceed to Checkout</ButtonText>
      </CheckoutButton>
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

const QuantityContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
`;

const QuantityButton = styled.TouchableOpacity`
  background-color: #ddd;
  padding: 5px 10px;
  border-radius: 5px;
  margin: 0 5px;
`;

const QuantityText = styled.Text`
  font-size: 16px;
`;

const RemoveButton = styled.TouchableOpacity`
  background-color: red;
  padding: 10px;
  border-radius: 5px;
`;

const TotalPrice = styled.Text`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
`;

const CheckoutButton = styled.TouchableOpacity`
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
