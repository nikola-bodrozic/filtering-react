import { createContext } from "react";
import type { State } from "./types";


export const UserContext = createContext<null | {
  state: State;
  addUser: () => Promise<void>;
  updateUser: (id: number, field: "name" | "email", value: string) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}>(null);
