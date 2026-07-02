import { Stack } from "expo-router";

export default function Logout() {
  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: false,
        }}
      />
      <h1>You have been successfully logged out</h1>
    </>
  );
}
