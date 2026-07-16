import { BACKEND_BASE_URL } from "@/config/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { ConversationPane } from "../../components/conversationsPane";
import { useAuth } from "../auth/AuthContext";

interface ChatbotResponseBody {
  response: string;
  trace_id?: string;
  error?: string;
}

interface NewConversationResponseBody {
  conversation: string;
}

export type Conversation = {
  id: string;
  studentId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

interface ConversationsResponseBody {
  conversations: Conversation[];
}

export default function Home() {
  const { accessToken, user } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const [conversationId, setConversationId] = useState<String | null>(null);

  const onClose = () => {
    setIsOpen(false);
  };

  const open = () => {
    setIsOpen(true);
  };

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // const isWeb = Platform.OS === "web";

  // const HOST = "LAPTOP-L6VTOSI4";

  const params = useLocalSearchParams();

  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;

  // console.log("conversationId localsearchparams: ", conversationId);

  const [chatMessageData, setChatMessageData] = useState({
    message: "",
    conversationId: "",
  });

  useEffect(() => {
    setChatMessageData((prev) => ({
      ...prev,
      conversationId: conversationId,
    }));
  }, [conversationId]);

  // console.log(
  //   "conversationId chatMessageData: ",
  //   chatMessageData.conversationId,
  // );

  const [chatResponse, setChatResponse] = useState("");

  const [thinkingDots, setThinkingDots] = useState("");

  const [isThinking, setIsThinking] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const showThinkingDots = async () => {
      if (!isThinking) return;

      var counter = 1;
      while (isThinking) {
        // console.log("eeee");
        if (counter == 4) {
          counter = 1;
        }
        let dotsString = "";
        for (let i = 0; i < counter; i++) {
          dotsString += ".";
        }
        setThinkingDots(dotsString);
        await sleep(50);
        counter++;
      }
    };

    showThinkingDots();
  }, [isThinking]);

  useEffect(() => {
    const fetchConversations = async () => {
      const conversations = await fetch(
        `${BACKEND_BASE_URL}/conversation/conversations`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          // credentials: "include",
          method: "GET",
        },
      );

      const conversationsJson: ConversationsResponseBody =
        await conversations.json();

      const conversationsList = conversationsJson.conversations;

      setConversations(conversationsList);

      if (!conversationId) {
        setChatMessageData((prev) => ({
          ...prev,
          conversationId: conversationsList[0].id,
        }));
      }
    };

    fetchConversations();
  }, [chatMessageData.conversationId]);

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
      setIsThinking(true);

      let conversationId = chatMessageData.conversationId;

      if (conversationId == "") {
        const newConversation = await fetch(
          `${BACKEND_BASE_URL}/conversation/new_conversation`,
          {
            body: JSON.stringify({
              title: "Untitled Conversation",
            }),
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            method: "POST",
          },
        );

        const newConversationJson: NewConversationResponseBody =
          await newConversation.json();

        conversationId = newConversationJson.conversation;

        setChatMessageData((prev) => ({
          ...prev,
          conversationId: newConversationJson.conversation,
        }));
      }
      const response = await fetch(`${BACKEND_BASE_URL}/chat/send`, {
        body: JSON.stringify({
          message: chatMessageData.message,
          conversationId,
        }),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        method: "POST",
      });

      // const resJson: ChatbotResponseBody = await response.json();

      // Reset message box
      setChatMessageData((prev) => ({
        ...prev,
        message: "",
      }));

      // Stop thinking
      setIsThinking(false);

      console.log("Response body: ", response.body);

      const reader = response.body?.getReader();

      const decoder = new TextDecoder();

      let text = "";

      console.log("aa");

      if (reader) {
        console.log("bb");
        while (true) {
          console.log("cc");
          const { value, done } = await reader.read();

          console.log("before");
          console.log("value: ", decoder.decode(value));
          console.log("done", done);
          console.log("after");

          if (done) break;

          const chunk = decoder.decode(value);
          console.log("chunk: ", chunk);
          for (const char of chunk) {
            text += char;
            sleep(500);
            setChatResponse(text);
          }
        }
      }

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Error",
          // text2: response.error,
        });
      } else {
        // setChatResponse(resJson.response);
        Toast.show({
          type: "success",
          text1: "Response successful",
          // text2: resJson.trace_id,
        });
        // console.log("trace id: ", resJson.trace_id);
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
    <View style={stylesheet.mainView}>
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
          <Text>
            {chatResponse}
            {chatResponse == "" && (
              <>
                <View style={stylesheet.emojiDiv}>
                  {isThinking && (
                    <View>
                      <Text>🎓</Text>
                      <Text>🤔</Text>
                    </View>
                  )}
                  <Text>{thinkingDots}</Text>
                </View>
              </>
            )}
            {chatResponse != "" && <Text>|</Text>}
          </Text>
        </View>
        <View style={stylesheet.conversationsButtonView}>
          <Button title="Conversations" onPress={() => open()} />
        </View>
      </View>
      {isOpen && (
        <View style={stylesheet.conversationPane}>
          <ConversationPane
            isOpen={isOpen}
            onClose={onClose}
            conversations={conversations}
            selectedConversationId={chatMessageData.conversationId}
            // style={stylesheet.conversationPane}
          />
        </View>
      )}
    </View>
  );
}

export const stylesheet = StyleSheet.create({
  outerView: {
    flex: 1,
    padding: "2%",
  },
  conversationPane: {
    // ...StyleSheet.absoluteFillObject,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // height: "100%",
  },
  conversationsButtonView: {
    // justifyContent: "flex-end",
    alignSelf: "flex-start",
    marginTop: "auto",
  },
  mainView: {
    // flex: 1,
    // flexDirection: "row",
    flex: 1,
    position: "relative",
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
  emojiDiv: {
    flexDirection: "row",
  },
});
