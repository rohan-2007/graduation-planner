import { Link } from "expo-router";
import { StyleSheet } from "react-native";

type hrefProps = {
  href: string;
  text: string;
};

export default function AppLink(props: hrefProps) {
  return (
    <Link href={props.href} style={styles.link}>
      {props.text}
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    color: "red",
    textDecorationLine: "underline",
  },
});
