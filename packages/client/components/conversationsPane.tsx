import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Conversation } from "../app/(tabs)/home";

type ConversationPaneProps = {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  selectedConversationId: string;
};

export const ConversationPane = ({
  isOpen,
  onClose,
  conversations,
  selectedConversationId,
}: ConversationPaneProps) => {
  const router = useRouter();

  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(selectedConversationId);

  const loadConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    onClose();
    router.push({
      pathname: "/home",
      params: {
        conversationId,
      },
    });
  };

  return isOpen ? (
    <View style={styles.outerDiv}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarHeading}>Past Conversations</Text>
        {conversations.map((conversation, index) => {
          const style =
            conversation.id === selectedConversation
              ? styles.conversationPressableSelected
              : styles.conversationPressable;
          return (
            <View key={index}>
              <Pressable
                onPress={() => loadConversation(conversation.id)}
                style={style}
              >
                <Text>
                  {index + 1}. {conversation.title}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <Pressable style={styles.backdrop} onPress={onClose} />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  backdrop: {
    // inset: 0,
    // position: "absolute",
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "60%",
  },
  sidebar: {
    width: "50%",
    backgroundColor: "white",
    padding: "2%",
    // flex: 1,
    // position: "absolute",
    // inset: 0,
  },
  sidebarHeading: {
    margin: "1%",
  },
  outerDiv: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  conversationPressable: {
    padding: 5,
    borderRadius: 5,
    width: "80%",
    margin: "1%",
  },
  conversationPressableSelected: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    width: "80%",
    margin: "1%",
  },
});
