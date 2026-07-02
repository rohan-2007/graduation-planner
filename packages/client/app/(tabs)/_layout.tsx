import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../auth/AuthContext";

export default function TabLayout() {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="second-page" />
    </Tabs>
  );
}
