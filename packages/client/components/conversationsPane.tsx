import { Pressable, StyleSheet, Text, View } from "react-native";

type ConversationPaneProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ConversationPane = ({
  isOpen,
  onClose,
}: ConversationPaneProps) => {
  return isOpen ? (
    <View style={styles.outerDiv}>
      <View style={styles.sidebar}>
        <Text>Past Conversations</Text>
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
    width: "40%",
    backgroundColor: "white",
    // flex: 1,
    // position: "absolute",
    // inset: 0,
  },
  outerDiv: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
});
