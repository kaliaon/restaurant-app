import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

// Mock data for analytics
const mockData = {
  revenue: {
    today: 1245.50,
    thisWeek: 7890.25,
    thisMonth: 32450.75,
    growth: 12.5
  },
  orders: {
    today: 42,
    thisWeek: 287,
    thisMonth: 1243,
    growth: 8.3
  },
  customers: {
    today: 38,
    thisWeek: 245,
    thisMonth: 980,
    growth: 15.2
  },
  popular: [
    { name: 'Grilled Salmon', orders: 156, revenue: 2808 },
    { name: 'Caesar Salad', orders: 124, revenue: 1488 },
    { name: 'Beef Wellington', orders: 98, revenue: 2450 },
    { name: 'Pasta Carbonara', orders: 87, revenue: 1218 }
  ]
};

// Mock AI insights
const mockAiInsights = [
  "Your dinner service is seeing a 15% increase in orders compared to last month.",
  "Consider promoting your Caesar Salad more as it has high margins and is popular.",
  "Tuesday evenings have slower sales - consider running a promotion.",
  "Your average order value has increased by 8% since introducing new premium items.",
  "Customer retention has improved - 65% of customers from last month returned this month."
];

export default function BusinessScreen() {
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  // Add role check and redirect if not business owner
  useEffect(() => {
    const checkBusinessAccess = async () => {
      try {
        // First check user from Redux
        if (user && user.role === 'business_owner') {
          // User is a business owner, allow access
          return;
        }
        
        // Fallback to AsyncStorage
        const storedUserJson = await AsyncStorage.getItem('user');
        if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson);
          if (storedUser && storedUser.role === 'business_owner') {
            // User is a business owner from AsyncStorage, allow access
            return;
          }
        }
        
        // If we get here, the user is not a business owner
        console.log('Unauthorized access to business page, redirecting...');
        router.replace('/');
      } catch (error) {
        console.error('Error checking business access:', error);
        router.replace('/');
      }
    };
    
    checkBusinessAccess();
  }, [user, router]);

  // Fetch data effect
  useEffect(() => {
    const loadData = async () => {
      // Simulate API fetch delay
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    loadData();
  }, []);

  // Simulate AI typing effect
  useEffect(() => {
    if (!loading) {
      typeAiMessage();
    }
  }, [loading, currentInsightIndex]);

  const typeAiMessage = () => {
    const message = mockAiInsights[currentInsightIndex];
    let index = 0;
    setAiMessage('');
    setAiTyping(true);
    
    const interval = setInterval(() => {
      if (index < message.length) {
        setAiMessage(prev => prev + message.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setAiTyping(false);
      }
    }, 30);
    
    return () => clearInterval(interval);
  };

  const handleNextInsight = () => {
    const nextIndex = (currentInsightIndex + 1) % mockAiInsights.length;
    setCurrentInsightIndex(nextIndex);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#4ECB71" />
        <LoadingText>Loading business insights...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Business Dashboard</Title>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <CardRow>
          <Card>
            <CardTitle>Revenue</CardTitle>
            <CardValue>${mockData.revenue.today.toFixed(2)}</CardValue>
            <CardSubtext>Today</CardSubtext>
            <GrowthIndicator positive={mockData.revenue.growth > 0}>
              <Ionicons 
                name={mockData.revenue.growth > 0 ? "arrow-up" : "arrow-down"} 
                size={16} 
                color={mockData.revenue.growth > 0 ? "#4ECB71" : "#E74C3C"} 
              />
              <GrowthText positive={mockData.revenue.growth > 0}>
                {Math.abs(mockData.revenue.growth)}%
              </GrowthText>
            </GrowthIndicator>
          </Card>
          
          <Card>
            <CardTitle>Orders</CardTitle>
            <CardValue>{mockData.orders.today}</CardValue>
            <CardSubtext>Today</CardSubtext>
            <GrowthIndicator positive={mockData.orders.growth > 0}>
              <Ionicons 
                name={mockData.orders.growth > 0 ? "arrow-up" : "arrow-down"} 
                size={16} 
                color={mockData.orders.growth > 0 ? "#4ECB71" : "#E74C3C"} 
              />
              <GrowthText positive={mockData.orders.growth > 0}>
                {Math.abs(mockData.orders.growth)}%
              </GrowthText>
            </GrowthIndicator>
          </Card>
        </CardRow>

        <CardRow>
          <Card>
            <CardTitle>Revenue (Month)</CardTitle>
            <CardValue>${mockData.revenue.thisMonth.toFixed(2)}</CardValue>
            <CardSubtext>This Month</CardSubtext>
          </Card>
          
          <Card>
            <CardTitle>Customers</CardTitle>
            <CardValue>{mockData.customers.today}</CardValue>
            <CardSubtext>Today</CardSubtext>
            <GrowthIndicator positive={mockData.customers.growth > 0}>
              <Ionicons 
                name={mockData.customers.growth > 0 ? "arrow-up" : "arrow-down"} 
                size={16} 
                color={mockData.customers.growth > 0 ? "#4ECB71" : "#E74C3C"} 
              />
              <GrowthText positive={mockData.customers.growth > 0}>
                {Math.abs(mockData.customers.growth)}%
              </GrowthText>
            </GrowthIndicator>
          </Card>
        </CardRow>

        {/* Popular Items */}
        <SectionTitle>Popular Items</SectionTitle>
        {mockData.popular.map((item, index) => (
          <PopularItem key={index}>
            <PopularItemRank>{index + 1}</PopularItemRank>
            <PopularItemDetails>
              <PopularItemName>{item.name}</PopularItemName>
              <PopularItemStats>
                <PopularItemStat>{item.orders} orders</PopularItemStat>
                <PopularItemStat>${item.revenue}</PopularItemStat>
              </PopularItemStats>
            </PopularItemDetails>
          </PopularItem>
        ))}

        {/* AI Insights */}
        <SectionTitle>AI Restaurant Coach</SectionTitle>
        <AiContainer>
          <AiHeader>
            <AiAvatar>
              <Ionicons name="analytics" size={24} color="#FFF" />
            </AiAvatar>
            <AiTitle>Business Insights</AiTitle>
          </AiHeader>
          <AiMessageContainer>
            <AiMessage>{aiMessage}</AiMessage>
            {aiTyping && <AiTypingIndicator />}
          </AiMessageContainer>
          <AiActionButton onPress={handleNextInsight}>
            <AiActionButtonText>Next Insight</AiActionButtonText>
          </AiActionButton>
        </AiContainer>
      </ScrollView>
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: #f8f9fa;
  padding: 20px;
  padding-top: 60px;
`;

const Header = styled.View`
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
`;

const CardRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const Card = styled.View`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  width: 48%;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const CardTitle = styled.Text`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
`;

const CardValue = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
`;

const CardSubtext = styled.Text`
  font-size: 12px;
  color: #95a5a6;
`;

const GrowthIndicator = styled.View<{ positive: boolean }>`
  flex-direction: row;
  align-items: center;
  position: absolute;
  top: 15px;
  right: 15px;
`;

const GrowthText = styled.Text<{ positive: boolean }>`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.positive ? '#4ECB71' : '#E74C3C'};
  margin-left: 2px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 10px;
  margin-bottom: 15px;
`;

const PopularItem = styled.View`
  flex-direction: row;
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3.84px;
  elevation: 3;
`;

const PopularItemRank = styled.Text`
  font-size: 18px;
  font-weight: bold;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  background-color: #4ECB71;
  color: white;
  border-radius: 15px;
`;

const PopularItemDetails = styled.View`
  flex: 1;
  margin-left: 15px;
`;

const PopularItemName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
`;

const PopularItemStats = styled.View`
  flex-direction: row;
  margin-top: 5px;
`;

const PopularItemStat = styled.Text`
  font-size: 14px;
  color: #7f8c8d;
  margin-right: 15px;
`;

const AiContainer = styled.View`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const AiHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: #3498db;
`;

const AiAvatar = styled.View`
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  justify-content: center;
  align-items: center;
`;

const AiTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-left: 10px;
`;

const AiMessageContainer = styled.View`
  padding: 20px;
  min-height: 100px;
`;

const AiMessage = styled.Text`
  font-size: 16px;
  color: #2c3e50;
  line-height: 24px;
`;

const AiTypingIndicator = styled.View`
  width: 8px;
  height: 8px;
  background-color: #3498db;
  border-radius: 4px;
  margin-top: 8px;
  opacity: 0.7;
`;

const AiActionButton = styled.TouchableOpacity`
  background-color: #f1f2f6;
  padding: 15px;
  align-items: center;
  border-top-width: 1px;
  border-top-color: #e6e6e6;
`;

const AiActionButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
`;

const LoadingText = styled.Text`
  margin-top: 10px;
  font-size: 16px;
  color: #7f8c8d;
`; 