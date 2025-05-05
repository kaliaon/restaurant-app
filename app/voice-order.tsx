import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, Animated } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import Voice from "@react-native-community/voice";
import menuData from "@/data/menu.json";
import * as Permissions from "expo-permissions";
import * as Animatable from 'react-native-animatable';

// Voice order status
enum VoiceOrderStatus {
  IDLE = "Tap to speak",
  LISTENING = "Listening...",
  PROCESSING = "Processing your order...",
  COMPLETED = "Order added to cart!",
  ERROR = "Sorry, I didn't understand that",
  NO_PERMISSION = "Microphone permission is required",
}

// Create audio wave animation component
const AudioWave = ({ isActive }) => {
  // Use 5 bars for the audio visualization
  const bars = [1, 2, 3, 4, 5];
  
  return (
    <AudioWaveContainer>
      {bars.map((bar) => (
        <Animatable.View
          key={bar}
          animation={isActive ? "pulse" : undefined}
          easing="ease-in-out"
          iterationCount="infinite"
          duration={1000 + (bar * 200)} // Slightly different timing for each bar
          style={{
            opacity: isActive ? 1 : 0.3,
            height: 30 + (bar * 5),
            width: 4,
            backgroundColor: "#4ecb71",
            borderRadius: 4,
            marginHorizontal: 4,
          }}
        />
      ))}
    </AudioWaveContainer>
  );
};

export default function VoiceOrderScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<VoiceOrderStatus>(VoiceOrderStatus.IDLE);
  const [results, setResults] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [matchedItems, setMatchedItems] = useState<any[]>([]);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  
  // Animation values for the microphone pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start the pulse animation for the microphone button
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Stop the pulse animation
  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Get microphone permissions
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      setHasMicPermission(status === 'granted');
      
      if (status !== 'granted') {
        setStatus(VoiceOrderStatus.NO_PERMISSION);
        Alert.alert(
          "Permission Required",
          "Voice ordering requires microphone access. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
      }
    };
    
    checkMicrophonePermission();
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    // Set up voice event handlers
    Voice.onSpeechStart = () => {
      setStatus(VoiceOrderStatus.LISTENING);
      startPulseAnimation();
    };
    
    Voice.onSpeechEnd = () => {
      setIsListening(false);
      setStatus(VoiceOrderStatus.PROCESSING);
      stopPulseAnimation();
    };
    
    Voice.onSpeechResults = (e) => {
      if (e.value) {
        setResults(e.value);
        processVoiceResults(e.value[0]);
      }
    };
    
    Voice.onSpeechError = (e) => {
      setIsListening(false);
      setStatus(VoiceOrderStatus.ERROR);
      stopPulseAnimation();
      console.error("Speech recognition error:", e);
    };

    // Clean up listeners on unmount
    return () => {
      // Check if Voice is defined before calling destroy
      if (Voice) {
        try {
          Voice.destroy()
            .then(() => {
              if (Voice) {
                Voice.removeAllListeners();
              }
            })
            .catch(e => console.error('Error destroying Voice instance:', e));
        } catch (e) {
          console.error('Error during voice cleanup:', e);
        }
      }
      // Also make sure to stop any ongoing animations
      stopPulseAnimation();
    };
  }, []);

  // Start listening for voice input
  const startListening = async () => {
    try {
      if (!hasMicPermission) {
        const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        setHasMicPermission(status === 'granted');
        
        if (status !== 'granted') {
          setStatus(VoiceOrderStatus.NO_PERMISSION);
          Alert.alert(
            "Permission Required",
            "Voice ordering requires microphone access. Please enable it in your device settings.",
            [{ text: "OK" }]
          );
          return;
        }
      }
      
      await Voice.start('en-US');
      setIsListening(true);
      setStatus(VoiceOrderStatus.LISTENING);
      setMatchedItems([]);
      setProcessingComplete(false);
      startPulseAnimation();
    } catch (e) {
      console.error("Error starting voice recognition:", e);
      setStatus(VoiceOrderStatus.ERROR);
    }
  };

  // Stop listening
  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      stopPulseAnimation();
    } catch (e) {
      console.error("Error stopping voice recognition:", e);
    }
  };

  // Process voice results to find menu items
  const processVoiceResults = (speechText: string) => {
    // Convert speech to lowercase for easier matching
    const speech = speechText.toLowerCase();
    console.log("Processing speech:", speech);

    // Find food items in the menu based on the speech
    const matched = menuData.filter(item => {
      // Get item name in lowercase
      const itemName = item.name.toLowerCase();
      
      // Check if the speech contains the item name
      return speech.includes(itemName);
    });

    setMatchedItems(matched);
    
    if (matched.length > 0) {
      setStatus(VoiceOrderStatus.COMPLETED);
      // Add matched items to cart with quantity 1
      matched.forEach(item => {
        dispatch(addToCart(item));
      });
    } else {
      setStatus(VoiceOrderStatus.ERROR);
    }
    
    setProcessingComplete(true);
  };

  // Go to cart
  const goToCart = () => {
    router.push("/cart");
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Voice Order</HeaderTitle>
        <CloseButton onPress={() => router.back()}>
          <CloseButtonText>×</CloseButtonText>
        </CloseButton>
      </Header>

      <InstructionText>
        Tap the microphone and speak your order clearly.
      </InstructionText>
      <ExampleText>
        Try saying: "I want a Cheeseburger" or "Order a Caesar Salad and Fries"
      </ExampleText>

      <VoiceStatusContainer>
        <StatusText error={status === VoiceOrderStatus.ERROR || status === VoiceOrderStatus.NO_PERMISSION}>
          {status}
        </StatusText>
      </VoiceStatusContainer>

      {/* Audio wave visualization */}
      <AudioWave isActive={isListening} />

      {/* Button to trigger voice recognition */}
      <MicrophoneButtonContainer>
        <Animated.View 
          style={{
            transform: [{ scale: isListening ? pulseAnim : 1 }],
            opacity: status === VoiceOrderStatus.NO_PERMISSION ? 0.5 : 1
          }}
        >
          <MicrophoneButton
            onPress={isListening ? stopListening : startListening}
            isListening={isListening}
            disabled={status === VoiceOrderStatus.NO_PERMISSION}
          >
            {isListening ? (
              <MicActiveContainer>
                <MicrophoneIcon 
                  source={require("@/assets/images/microphone.png")} 
                  tintColor="#fff"
                />
              </MicActiveContainer>
            ) : (
              <MicrophoneIcon 
                source={require("@/assets/images/microphone.png")} 
                style={{ opacity: status === VoiceOrderStatus.NO_PERMISSION ? 0.5 : 1 }}
              />
            )}
          </MicrophoneButton>
        </Animated.View>
        <MicrophoneButtonLabel>
          {isListening ? "Tap to stop" : "Tap to speak"}
        </MicrophoneButtonLabel>
      </MicrophoneButtonContainer>

      {/* Results area */}
      {results.length > 0 && (
        <ResultsContainer>
          <ResultsTitle>You said:</ResultsTitle>
          <ResultsText>{results[0]}</ResultsText>
        </ResultsContainer>
      )}

      {/* Matched items */}
      {matchedItems.length > 0 && (
        <MatchedItemsContainer>
          <ResultsTitle>Found items:</ResultsTitle>
          {matchedItems.map((item, index) => (
            <Animatable.View 
              key={index}
              animation="fadeInUp" 
              delay={index * 100}
              duration={500}
            >
              <MatchedItem>
                <ItemImage source={{ uri: item.image }} />
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                </ItemDetails>
                <AddedBadge>
                  <AddedBadgeText>Added</AddedBadgeText>
                </AddedBadge>
              </MatchedItem>
            </Animatable.View>
          ))}
        </MatchedItemsContainer>
      )}

      {/* Status message when no items found */}
      {processingComplete && matchedItems.length === 0 && (
        <Animatable.View animation="fadeIn" duration={500}>
          <NoMatchText>
            No items found. Please try again with a different phrase.
          </NoMatchText>
        </Animatable.View>
      )}

      {/* Navigation buttons */}
      <ButtonsContainer>
        <ActionButton onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </ActionButton>

        {matchedItems.length > 0 && (
          <ActionButton primary onPress={goToCart}>
            <ButtonText primary>Go to Cart</ButtonText>
          </ActionButton>
        )}
      </ButtonsContainer>
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
  margin-bottom: 20px;
`;

const HeaderTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
`;

const CloseButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #f0f0f0;
  justify-content: center;
  align-items: center;
`;

const CloseButtonText = styled.Text`
  font-size: 24px;
  color: #555;
  margin-top: -2px;
`;

const InstructionText = styled.Text`
  font-size: 18px;
  text-align: center;
  margin-bottom: 10px;
`;

const ExampleText = styled.Text`
  font-size: 14px;
  color: gray;
  text-align: center;
  margin-bottom: 40px;
`;

const VoiceStatusContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const StatusText = styled.Text<{ error?: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.error ? '#ff4545' : '#4ecb71'};
`;

const AudioWaveContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  height: 60px;
  margin-bottom: 30px;
`;

const MicrophoneButtonContainer = styled.View`
  align-items: center;
  margin-bottom: 30px;
`;

const MicrophoneButton = styled.TouchableOpacity<{ isListening: boolean; disabled?: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${props => {
    if (props.disabled) return '#cccccc';
    return props.isListening ? '#ff4545' : '#4ecb71';
  }};
  justify-content: center;
  align-items: center;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const MicActiveContainer = styled.View`
  width: 70%;
  height: 70%;
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
`;

const MicrophoneButtonLabel = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 10px;
`;

const MicrophoneIcon = styled.Image`
  width: 40px;
  height: 40px;
  tint-color: white;
`;

const ResultsContainer = styled.View`
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
`;

const ResultsTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ResultsText = styled.Text`
  font-size: 16px;
`;

const MatchedItemsContainer = styled.View`
  margin-top: 20px;
`;

const MatchedItem = styled.View`
  flex-direction: row;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  align-items: center;
`;

const ItemImage = styled.Image`
  width: 60px;
  height: 60px;
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

const AddedBadge = styled.View`
  background-color: #4ecb71;
  padding: 5px 10px;
  border-radius: 15px;
`;

const AddedBadgeText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const NoMatchText = styled.Text`
  font-size: 16px;
  color: red;
  text-align: center;
  margin-top: 20px;
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
`;

const ActionButton = styled.TouchableOpacity<{ primary?: boolean }>`
  flex: 1;
  background-color: ${props => props.primary ? '#4ecb71' : '#f0f0f0'};
  padding: 15px;
  align-items: center;
  border-radius: 10px;
  margin: 0 5px;
  elevation: 2;
`;

const ButtonText = styled.Text<{ primary?: boolean }>`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.primary ? 'white' : 'black'};
`; 