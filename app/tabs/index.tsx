import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const courses = ["CSE 2231", "ENGR 1282.01", "STAT 3470"];
  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.h1, styles.topBottomSpacing]}>Courses</Text>
      {/* <Text>This is index page</Text> */}
      {courses.map((title) => (
        <View style={[styles.card, styles.topBottomSpacing]}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      ))}
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
    // backgroundColor: "red",
    padding: "5%",
    borderRadius: 10,
  },
  cardTitle: {
    color: "white",
  },
});
