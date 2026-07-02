import { router, Stack } from "expo-router";
import { Button } from "react-native";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function RootStack() {
  const { accessToken, logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerTitle: "gradBuddy",
        headerRight: () =>
          accessToken ? (
            <Button
              title="Logout"
              onPress={() => {
                Toast.show({
                  type: "success",
                  text1: "Logged out Successfully!",
                });
                logout();
                router.replace("/login");
              }}
            />
          ) : null,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* <ProtectedRoute> */}
      <RootStack />
      {/* </ProtectedRoute> */}
      {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
      {/* </Stack> */}
      <Toast />
    </AuthProvider>
  );
}
