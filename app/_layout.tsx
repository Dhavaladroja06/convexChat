import { Link, SplashScreen, Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false
})

export default function RootLayoutNav() {
  return (
    <ConvexProvider client={convex}>
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: "#EEA217",
        },
        headerTintColor: "#fff"
      }}>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "My Chats",
            headerRight: () => (
              <Link href={"/(modal)/create"} asChild>
                <Pressable android_ripple={{ color:"#ffffffa1" }}>
                  <Ionicons name="add" size={32} color={"#fff"} />
                </Pressable>
              </Link>
            )
          }}
        />
        <Stack.Screen
        name="(modal)/create"
        options={{ 
          headerTitle:"Start a Chat",
          presentation:"fullScreenModal",
          headerLeft: () => (
            <Link href={"/"}asChild>
              <Pressable android_ripple={{ color:"#ffffffa1" }}>
                <Ionicons name="close-outline" size={32} color={"#fff"} />
              </Pressable>
            </Link>
          )
         }}
        />
        <Stack.Screen
        name="(chat)/[chatid]"
        options={{ 
          headerTitle:"",
          headerLeft : () => ("")
         }}
        />
      </Stack>
    </ConvexProvider>
  )
}