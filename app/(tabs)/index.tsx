import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import menuData from "@/data/menu.json"; // Import JSON directly
import { Ionicons } from "@expo/vector-icons";

// Define declaration for styled-components/native to fix TypeScript error
declare module 'styled-components/native' {
  export interface DefaultTheme {}
}

const { width, height } = Dimensions.get("window"); // Ensure proper screen dimensions

// Define menu categories
const CATEGORIES = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Pizza",
  "Pasta",
  "Fast Food",
  "Soups",
  "Desserts",
  "Kazakh Fusion"
];

// Define type for menu item
interface MenuItem {
  id: string;
  name: string;
  image: string;
  rating: number;
  comments: number;
  category: string;
  difficulty: string;
  distance: string;
  time: string;
  price: number;
  ingredients: string[];
  description: string;
  availability: string;
  spiceLevel: string;
  isRecommended: boolean;
  isPopular: boolean;
}

// Define prop types for styled components
interface CategoryButtonProps {
  selected: boolean;
}

interface CategoryTextProps {
  selected: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [foodData, setFoodData] = useState<{
    all: MenuItem[];
    filtered: MenuItem[];
  }>({
    all: [],
    filtered: [],
  });

  useEffect(() => {
    // Initialize all food data
    setFoodData({
      all: menuData as MenuItem[],
      filtered: menuData as MenuItem[],
    });
    setLoading(false);
  }, []);

  // Filter food items by category
  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    
    if (category === "All") {
      setFoodData({
        ...foodData,
        filtered: menuData as MenuItem[],
      });
    } else {
      setFoodData({
        ...foodData,
        filtered: (menuData as MenuItem[]).filter((item) => item.category === category),
      });
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#4ECb71" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Header with Cart button only */}
      <Header>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Menu</Text>
        <HeaderButtons>
          <CartButton onPress={() => router.push("/cart")}>
            <CartIcon source={require("@/assets/images/cart.png")} />
          </CartButton>
        </HeaderButtons>
      </Header>

      {/* Category Selector */}
      <CategoryContainer>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <CategoryButton 
              selected={selectedCategory === item}
              onPress={() => filterByCategory(item)}
            >
              <CategoryText selected={selectedCategory === item}>{item}</CategoryText>
            </CategoryButton>
          )}
        />
      </CategoryContainer>

      {/* Menu Items Section */}
      <SectionTitle>{selectedCategory === "All" ? "All Menu Items" : selectedCategory}</SectionTitle>
      <FlatList
        data={foodData.filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodCard onPress={() => router.push(`/food-details?id=${item.id}`)}>
            <FoodImageContainer>
              <FoodImage source={{ uri: item.image }} />
              {item.isRecommended && (
                <RecommendedBadge>
                  <Ionicons name="star" size={12} color="#fff" />
                  <RecommendedText>Recommended</RecommendedText>
                </RecommendedBadge>
              )}
            </FoodImageContainer>
            <FoodInfo>
              <FoodTitle>{item.name}</FoodTitle>
              <CategoryLabel>{item.category}</CategoryLabel>
              <RatingContainer>
                <Text>⭐ {item.rating} ({item.comments} reviews)</Text>
                <Text>📍 {item.distance} | ⏳ {item.time}</Text>
                <PriceText>{item.price} ₸</PriceText>
              </RatingContainer>
            </FoodInfo>
          </FoodCard>
        )}
      />

      {/* Voice Order Floating Button */}
      <VoiceOrderFloatingButton onPress={() => router.push("/voice-order")}>
        <VoiceOrderFloatingButtonText>Order with Voice</VoiceOrderFloatingButtonText>
      </VoiceOrderFloatingButton>
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
  margin-bottom: 15px;
`;

const HeaderButtons = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CategoryContainer = styled.View`
  margin-bottom: 15px;
`;

const CategoryButton = styled.TouchableOpacity<CategoryButtonProps>`
  padding: 8px 16px;
  margin-right: 8px;
  background-color: ${(props: CategoryButtonProps) => props.selected ? '#4ECb71' : '#f5f5f5'};
  border-radius: 20px;
`;

const CategoryText = styled.Text<CategoryTextProps>`
  font-size: 14px;
  color: ${(props: CategoryTextProps) => props.selected ? 'white' : '#333'};
  font-weight: ${(props: CategoryTextProps) => props.selected ? 'bold' : 'normal'};
`;

const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const FoodCard = styled.TouchableOpacity`
  flex-direction: row;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  position: relative;
  height: 150px;
`;

const FoodImageContainer = styled.View`
  width: 130px;
  height: 100%;
  position: relative;
`;

const FoodImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: cover;
`;

const RecommendedBadge = styled.View`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #FF9900;
  border-radius: 5px;
  padding: 4px 8px;
  flex-direction: row;
  align-items: center;
  z-index: 1;
`;

const RecommendedText = styled.Text`
  color: white;
  font-size: 11px;
  font-weight: bold;
  margin-left: 3px;
`;

const FoodInfo = styled.View`
  flex: 1;
  padding: 12px;
  justify-content: space-between;
`;

const FoodTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const CategoryLabel = styled.Text`
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  align-self: flex-start;
  margin-top: 2px;
  margin-bottom: 2px;
`;

const PriceText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #4ECb71;
  margin-top: 4px;
`;

const RatingContainer = styled.View`
  flex-direction: column;
  margin-top: 3px;
  justify-content: space-between;
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
  margin-left: 10px;
`;

const CartIcon = styled.Image`
  width: 28px;
  height: 28px;
`;

const VoiceOrderFloatingButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: #4ecb71;
  padding: 15px 20px;
  border-radius: 25px;
  elevation: 5;
`;

const VoiceOrderFloatingButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;
