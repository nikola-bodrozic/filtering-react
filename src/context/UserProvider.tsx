import React, { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";

export type User = {
  id: number;
  name: string;
  email: string;
};

type State = {
  users: User[];
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "setUsers"; users: User[] }
  | { type: "addUser"; user: User }
  | { type: "updateUser"; id: number; field: "name" | "email"; value: string }
  | { type: "removeUser"; id: number }
  | { type: "setLoading"; loading: boolean }
  | { type: "setError"; error: string | null };

const initialState: State = {
  users: [],
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setUsers":
      return { ...state, users: action.users, loading: false };
    case "addUser":
      return { ...state, users: [...state.users, action.user] };
    case "updateUser":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id ? { ...u, [action.field]: action.value } : u
        ),
      };
    case "removeUser":
      return { ...state, users: state.users.filter((u) => u.id !== action.id) };
    case "setLoading":
      return { ...state, loading: action.loading };
    case "setError":
      return { ...state, error: action.error, loading: false };
    default:
      return state;
  }
}

const UserContext = createContext<{
  state: State;
  addUser: () => Promise<void>;
  updateUser: (id: number, field: "name" | "email", value: string) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUsers must be used within UserProvider");
  return context;
}

// --- API base URL ---
const API_URL = "https://nikolabodr.com/api.php";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // --- Load all users from API ---
  const refreshUsers = async () => {
    dispatch({ type: "setLoading", loading: true });
    try {
      const res = await axios.get(API_URL);
      dispatch({ type: "setUsers", users: res.data.users || [] });
    } catch (err) {
      console.error(err);
      dispatch({ type: "setError", error: "Failed to load users" });
    }
  };

  // --- Add new user ---
  const addUser = async () => {
    const newUser: User = {
      id: Math.floor(Math.random() * 1000000),
      name: `User ${Date.now()}`,
      email: `user${Date.now()}@mail.com`,
    };
    try {
      const res = await axios.post(API_URL, { type: "addUser", user: newUser });
      if (res.data.users) {
        dispatch({ type: "setUsers", users: res.data.users });
      } else {
        dispatch({ type: "addUser", user: newUser });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: "setError", error: "Failed to add user" });
    }
  };

  // --- Update user ---
  const updateUser = async (id: number, field: "name" | "email", value: string) => {
    try {
      const res = await axios.post(API_URL, { type: "updateUser", id, field, value });
      if (res.data.users) {
        dispatch({ type: "setUsers", users: res.data.users });
      } else {
        dispatch({ type: "updateUser", id, field, value });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: "setError", error: "Failed to update user" });
    }
  };

  // --- Remove user ---
  const removeUser = async (id: number) => {
    try {
      const res = await axios.post(API_URL, { type: "removeUser", id });
      if (res.data.users) {
        dispatch({ type: "setUsers", users: res.data.users });
      } else {
        dispatch({ type: "removeUser", id });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: "setError", error: "Failed to remove user" });
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <UserContext.Provider value={{ state, addUser, updateUser, removeUser, refreshUsers }}>
      {children}
    </UserContext.Provider>
  );
};
