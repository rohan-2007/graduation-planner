import { BACKEND_BASE_URL } from "@/config/api";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { accessToken, user } = useAuth();

  const HOST = "LAPTOP-L6VTOSI4";

  interface ChatbotResponseBody {
    response: string;
    trace_id?: string;
    error?: string;
  }

  const [chatMessageData, setChatMessageData] = useState({
    message: "",
  });

  const [chatResponse, setChatResponse] = useState("");

  const handleInputChange = (name: string, value: string) => {
    setChatMessageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // useEffect(() => {
  //   const getUser = async () => {
  //     try {
  //       const res = await fetch(`http://${HOST}.local:3001/auth/me`, {
  //         headers: { "Content-Type": "application/json" },
  //         credentials: "include",
  //         method: "POST",
  //       });

  //       const resJson = await res.json;
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         Toast.show({
  //           type: "error",
  //           text1: "Error",
  //           text2: error.message,
  //         });
  //       }
  //       Toast.show({
  //         type: "error",
  //         text1: "Error",
  //         text2: "Error fetching chat response",
  //       });
  //     }
  //   };

  //   getUser();
  // }, []);

  const sendMessage = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/chat/send`, {
        body: JSON.stringify(chatMessageData),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        method: "POST",
      });

      const resJson: ChatbotResponseBody = await response.json();

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: resJson.error,
        });
      } else {
        setChatResponse(resJson.response);
        Toast.show({
          type: "success",
          text1: "Response successful",
          text2: resJson.trace_id,
        });
        console.log("trace id: ", resJson.trace_id);
      }
    } catch (error) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      }
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error fetching chat response",
      });
    }
  };

  return (
    <View style={stylesheet.outerView}>
      <Text>Welcome, {user?.name}!</Text>
      <Text>
        {user?.school} student, expected to graduate in {user?.gradYear}
      </Text>
      <View style={stylesheet.cardDiv}>
        <View style={stylesheet.card}>
          <Text>School: </Text>
          <Text>{user?.school}</Text>
        </View>
        <View style={stylesheet.card}>
          <Text>Graduation Year: </Text>
          <Text>{user?.gradYear}</Text>
        </View>
      </View>
      <Text>Hello {user?.name}!</Text>
      {/* <Text>This is index page</Text> */}
      <TextInput
        value={chatMessageData.message}
        onChangeText={(text) => handleInputChange("message", text)}
        placeholder="Message"
      />
      <Button title="Submit" onPress={() => sendMessage()} />
      <View>
        <Text>{chatResponse}</Text>
      </View>
    </View>
  );
}

export const stylesheet = StyleSheet.create({
  outerView: {
    flex: 1,
    padding: "2%",
  },
  cardDiv: {
    gap: 12,
  },
  card: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    width: "15%",
    borderRadius: "10px",
    backgroundColor: "lightgreen",
  },
});
