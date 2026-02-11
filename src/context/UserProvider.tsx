// src/context/UserProvider.tsx
import React, { useEffect, useReducer } from "react"; // added useContext
import axios from "axios";
import type { State, Action } from "./types";
import { UserContext } from "./UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const initialState: State = {
  users: [],
  loading: false,
  error: null,
};

export interface User {
  id: number;
  email: string;
  name: string;
}

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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshUsers = async () => {
    dispatch({ type: "setLoading", loading: true });
    try {
      const res = await axios.get(API_URL);
      dispatch({ type: "setUsers", users: res.data.users ?? [] });
    } catch {
      dispatch({ type: "setError", error: "Failed to load users" });
    }
  };

  const addUser = async () => {
    const newUser: User = {
      id: Math.floor(Math.random() * 1_000_000),
      name: `User ${Date.now()}`,
      email: `user${Date.now()}@mail.com`,
    };
    try {
      const res = await axios.post(API_URL, { type: "addUser", user: newUser });
      if (res.data.users) dispatch({ type: "setUsers", users: res.data.users });
      else dispatch({ type: "addUser", user: newUser });
    } catch {
      dispatch({ type: "setError", error: "Failed to add user" });
    }
  };

  const updateUser = async (id: number, field: "name" | "email", value: string) => {
    try {
      const res = await axios.post(API_URL, { type: "updateUser", id, field, value });
      if (res.data.users) dispatch({ type: "setUsers", users: res.data.users });
      else dispatch({ type: "updateUser", id, field, value });
    } catch {
      dispatch({ type: "setError", error: "Failed to update user" });
    }
  };

  const removeUser = async (id: number) => {
    try {
      const res = await axios.post(API_URL, { type: "removeUser", id });
      if (res.data.users) dispatch({ type: "setUsers", users: res.data.users });
      else dispatch({ type: "removeUser", id });
    } catch {
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
