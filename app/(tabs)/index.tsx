import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import menuData from "@/data/menu.json"; // Import JSON directly

const { width, height } = Dimensions.get("window"); // Ensure proper screen dimensions

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState({
    all: [],
    recommended: [],
    popular: [],
  });

  useEffect(() => {
    setFoodData({
      all: menuData,
      recommended: menuData.filter((item) => item.isRecommended),
      popular: menuData.filter((item) => item.isPopular).slice(0, 5),
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#4ECb71" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Recommended</Text>
        <CartButton onPress={() => router.push("/cart")}>
          <CartIcon source={require("@/assets/images/cart.png")} />
        </CartButton>
      </Header>

      {/* Recommended Foods - Adaptive Vertical Carousel */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ height: width * 0.6 }}>
        {foodData.recommended.map((item) => (
          <CarouselCard key={item.id} onPress={() => router.push(`/food-details?id=${item.id}`)}>
            <CarouselImage source={{ uri: item.image }} resizeMode="cover" />
            <CarouselOverlay>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>{item.name}</Text>
              <Text style={{ color: "#fff" }}>⭐ {item.rating} ({item.comments} reviews)</Text>
              <Text style={{ color: "#fff" }}>📍 {item.distance} | ⏳ {item.time}</Text>
            </CarouselOverlay>
          </CarouselCard>
        ))}
      </ScrollView>

      {/* Popular Section */}
      <SectionTitle>Popular</SectionTitle>
      <FlatList
        data={foodData.popular}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodCard onPress={() => router.push(`/food-details?id=${item.id}`)}>
            <FoodImage source={{ uri: item.image }} />
            <FoodInfo>
              <FoodTitle>{item.name}</FoodTitle>
              <RatingContainer>
                <Text>⭐ {item.rating} ({item.comments} comments)</Text>
                <Text>📍 {item.distance} | ⏳ {item.time}</Text>
              </RatingContainer>
            </FoodInfo>
          </FoodCard>
        )}
      />
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
  font-size: 22px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const FoodCard = styled.TouchableOpacity`
  flex-direction: row;
  background-color: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  elevation: 2;
`;

const FoodImage = styled.Image`
  width: 100px;
  height: 100px;
`;

const FoodInfo = styled.View`
  flex: 1;
  padding: 10px;
`;

const FoodTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const RatingContainer = styled.View`
  flex-direction: column;
  margin-top: 5px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const CarouselCard = styled.TouchableOpacity`
  width: ${width}px;
  height: ${width * 0.6}px; /* Adjust height dynamically */
  position: relative;
`;

const CarouselImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const CarouselOverlay = styled.View`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 10px;
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
