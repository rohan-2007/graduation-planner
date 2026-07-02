import { BACKEND_BASE_URL } from "@/config/api";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { storage } from "../utils/storage";
import { useAuth } from "./auth/AuthContext";

export default function Login() {
  const { setAccessToken, setUser } = useAuth();

  // const HOST = "LAPTOP-L6VTOSI4";
  // const IP = "172.28.68.247";

  const router = useRouter();

  const [loginFormData, setLoginFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setLoginFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useFocusEffect(
    useCallback(() => {
      setLoginFormData({
        username: "",
        password: "",
      });
    }, []),
  );

  // useEffect(() => {
  //   fetch(`http://${IP}:3001/`)
  //     .then((r) => r.json())
  //     .then((data) => setMessage(data.message));
  // }, []);
  // fetch(`http://${IP}:3001/courses`)
  //   .then((r) => r.json())
  //   .then((data) => setCourses(data.courses));

  const login = async () => {
    console.log("API URL:", `${BACKEND_BASE_URL}/auth/login`);
    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      body: JSON.stringify(loginFormData),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      method: "POST",
    });

    const resJson = await response.json();

    if (!response.ok) {
      if (response.status == 400) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "All fields are required",
        });
      } else if (response.status == 404) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Account does not exist. Sign up instead.",
        });
      } else if (response.status == 401) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid Credentials",
        });
      }
      console.error("Error logging user in");
      return;
    } else {
      const token = resJson.jwt;
      const user = resJson.user;
      await storage.setItem("token", token);
      await storage.setItem("user", JSON.stringify(user));
      setAccessToken(token);
      setUser(user);
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: resJson.message,
      });
      console.log("Logged in successfully");
      // setTimeout(() => {
      router.push({
        pathname: "/home",
      });
      // }, 2000);
      return;
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.h1, styles.topBottomSpacing]}>Login</Text>
      <TextInput
        value={loginFormData.username}
        onChangeText={(text) => handleInputChange("username", text)}
        placeholder="Username"
      />
      <TextInput
        value={loginFormData.password}
        onChangeText={(text) => handleInputChange("password", text)}
        placeholder="Password"
      />
      <Button title="Login" onPress={login} />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    padding: "10%",
  },
  topBottomSpacing: {
    marginTop: "2%",
    marginBottom: "2%",
  },
  h1: {
    fontSize: 20,
  },
  card: {
    width: "80%",
    // height: "20%",
    backgroundColor: "red",
    padding: "5%",
    borderRadius: 10,
  },
  cardTitle: {
    color: "white",
  },
});
