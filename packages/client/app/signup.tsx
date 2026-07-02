import AppLink from "@/components/AppLink";
import { BACKEND_BASE_URL } from "@/config/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Signup() {
  const HOST = "LAPTOP-L6VTOSI4";
  // const IP = "172.28.68.247";

  const router = useRouter();

  const [signupFormData, setSignupFormData] = useState({
    username: "",
    password: "",
    school: "",
    gradYear: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setSignupFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // useEffect(() => {
  //   fetch(`http://${IP}:3001/`)
  //     .then((r) => r.json())
  //     .then((data) => setMessage(data.message));
  // }, []);
  // fetch(`http://${IP}:3001/courses`)
  //   .then((r) => r.json())
  //   .then((data) => setCourses(data.courses));

  const signup = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/signup`, {
        body: JSON.stringify({
          ...signupFormData,
          gradYear: parseInt(signupFormData.gradYear),
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "POST",
      });

      if (!response.ok) {
        if (response.status == 400) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "All fields are required",
          });
        } else if (response.status == 409) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "User already exists",
          });
        } else if (response.status == 500) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Internal Server Error",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to fetch",
          });
        }
        console.error("Error adding user");
        return;
      } else {
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Added user successfully",
        });
        console.log("Added user successfully");
      }
      setTimeout(() => {
        router.push({
          pathname: "/login",
          params: {},
        });
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error signing up user: ${error.message}`);
        Toast.show({
          type: "error",
          text1: "Error signing up user",
          text2: error.message,
        });
      } else {
        console.error(`Error signing up user: unknown error`);
        Toast.show({
          type: "error",
          text1: "Error signing up user",
          text2: "Unknown error",
        });
      }
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.h1, styles.topBottomSpacing]}>Signup</Text>
      <TextInput
        value={signupFormData.username}
        onChangeText={(text) => handleInputChange("username", text)}
        placeholder="Username"
      />
      <TextInput
        value={signupFormData.password}
        onChangeText={(text) => handleInputChange("password", text)}
        placeholder="Password"
      />
      <TextInput
        value={signupFormData.school}
        onChangeText={(text) => handleInputChange("school", text)}
        placeholder="School"
      />
      <TextInput
        value={signupFormData.gradYear}
        onChangeText={(text) => handleInputChange("gradYear", text)}
        placeholder="Graduation Year"
      />
      <Button title="Signup" onPress={signup} />
      <Text>
        Already have an account?{" "}
        <AppLink href={"/login"} text={"Login instead"} />
        {/* <Link style={styles.link} href={"/login"}>
          Login instead
        </Link> */}
      </Text>
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
  link: {
    color: "blue",
  },
});
