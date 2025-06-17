import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import styled from "styled-components/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import menuData from "@/data/menu.json";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams(); // Get the food ID from URL
  const router = useRouter();
  const dispatch = useDispatch();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedFood = menuData.find((item) => item.id === id);
    if (selectedFood) {
      setFood(selectedFood);
    }
    setLoading(false);
  }, [id]);

  const handleAddToCart = () => {
    if (food?.availability === "Out of Stock") {
      Alert.alert("Sorry!", "This item is currently out of stock.");
      return;
    }
    dispatch(addToCart(food));
    Alert.alert("Success", `${food.name} added to cart!`);

    router.push("/cart");
  };

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#4ECb71" />
      </LoadingContainer>
    );
  }

  if (!food) {
    return (
      <Container>
        <Text>Food item not found.</Text>
      </Container>
    );
  }

  return (

    <>

    <Container>
      <FoodImage source={{ uri: food.image }} />
      <FoodInfo>
        <FoodTitle>{food.name}</FoodTitle>
        <PriceText>{food.price} ₸</PriceText>
        <AvailabilityText availability={food.availability}>
          {food.availability}
        </AvailabilityText>
        <Description>{food.description}</Description>

        <SectionTitle>Ingredients</SectionTitle>
        {food.ingredients.map((ingredient, index) => (
          <IngredientItem key={index}>{ingredient}</IngredientItem>
        ))}

        <AddToCartButton onPress={handleAddToCart}>
          <ButtonText>Add to Cart</ButtonText>
        </AddToCartButton>

        <GoBackButton onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </GoBackButton>
      </FoodInfo>
    </Container>
    </>
  );
}

// Styled Components
const Container = styled.ScrollView`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
`;

const FoodImage = styled.Image`
  width: 100%;
  height: 250px;
  border-radius: 10px;
  resize-mode: cover;
`;

const FoodInfo = styled.View`
  margin-top: 15px;
`;

const FoodTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
`;

const PriceText = styled.Text`
  font-size: 20px;
  color: #4ecb71;
  margin-top: 5px;
`;

const AvailabilityText = styled.Text`
  font-size: 16px;
  margin-top: 5px;
  color: ${({ availability }) => (availability === "Available" ? "green" : "red")};
`;

const Description = styled.Text`
  font-size: 16px;
  margin-top: 10px;
  color: gray;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-top: 15px;
`;

const IngredientItem = styled.Text`
  font-size: 16px;
  margin-left: 10px;
  color: #333;
`;

const AddToCartButton = styled.TouchableOpacity`
  background-color: #4ecb71;
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin-top: 20px;
`;

const GoBackButton = styled.TouchableOpacity`
  background-color: #f0f0f0;
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: black;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const CartButton = styled.TouchableOpacity`
  padding: 10px;
  border-radius: 50px;
  background-color: #f5f5f5;
`;

const CartIcon = styled.Image`
  width: 28px;
  height: 28px;
`;
