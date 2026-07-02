import { useAuth } from "@/app/auth/AuthContext";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

export const ProtectedRoute = ({ children }: Props) => {
  const { accessToken } = useAuth();

  // Not logged in
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Logged in
  return children;
};
