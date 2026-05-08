import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import ReviewScreen from "./src/screens/ReviewScreen";
import EventFormScreen from "./src/screens/EventFormScreen";
import type { CardData, EventConfig } from "./src/types";

export type RootStackParamList = {
  Home: undefined;
  Review: { card: CardData; imagesBase64: string[] };
  EventForm: { card: CardData; imagesBase64: string[]; event: EventConfig };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ title: "ตรวจสอบนามบัตร" }}
          />
          <Stack.Screen
            name="EventForm"
            component={EventFormScreen}
            options={{ title: "ข้อมูล Event" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
