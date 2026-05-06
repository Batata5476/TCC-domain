import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ECEFDA",
          },
          headerTintColor: "#285A71",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}