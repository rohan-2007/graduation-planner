import { Redirect } from "expo-router";
import { useAuth } from "../app/auth/AuthContext";

export default function Index() {
  const { accessToken, user } = useAuth();
  console.log("accessToken OUTSIDE: ", accessToken);
  const HOST = "LAPTOP-L6VTOSI4";

  // const [loggedIn, setLoggedIn] = useState(false);

  // useEffect(() => {
  //   console.log("accessToken INSIDE: ", accessToken);
  //   if (accessToken) {
  //     setLoggedIn(true);
  //   }
  // }, []);

  // useEffect(() => {
  //   async () => {
  //     try {
  //       const response = await fetch(`http://${HOST}.local:3001/auth/me`, {
  //         headers: { "Content-Type": "application/json" },
  //         credentials: "include",
  //         method: "GET",
  //       });

  //       const resJson = await response.json();

  //       if (response.status == 201) {
  //         setLoggedIn(true);
  //         setUsername(resJson.username);
  //       }
  //     } catch (error) {}
  //   };
  // }, []);

  return accessToken ? (
    <Redirect href={{ pathname: "/home" }} />
  ) : (
    <Redirect href="/signup" />
  );
}

// import { useRouter } from "expo-router";
// import { useEffect } from "react";

// export default function Index() {
//   const router = useRouter();

//   useEffect(() => {
//     async () => {
//       // await router.replace("/signup.tsx");
//       router.push("/signup");
//     };
//   }, []);

//   return null;
// }

// import { useRouter } from "expo-router";
// import { useEffect } from "react";

// export default function Index() {
//   const router = useRouter();

//   useEffect(() => {
//     router.replace("/signup"); // replace() prevents back navigation
//   }, []);

//   return null;
// }
