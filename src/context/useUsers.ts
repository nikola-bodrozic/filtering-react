import { useContext } from "react";
import { UserContext } from "./UserContext";

export function useUsers() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUsers must be used within UserProvider");
  return context;
}
