import { createContext, useContext, useReducer } from "react";

export type User = {
  id: number;
  name: string;
  email: string;
};

type State = {
  users: User[];
};

type Action = { type: "addUser"; user: User; } |
{ type: "updateUser"; id: number; field: "name" | "email"; value: string; } |
{ type: "removeUser"; id: number; };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "addUser":
      return { users: [...state.users, action.user] };

    case "updateUser":
      return {
        users: state.users.map((u) => u.id === action.id ? { ...u, [action.field]: action.value } : u
        ),
      };

    case "removeUser":
      return { users: state.users.filter((u) => u.id !== action.id) };

    default:
      return state;
  }
}

// --- Context setup ---
const UserContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  getNextId: () => number;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUsers must be used within UserProvider");
  return context;
}

// --- Provider ---
export const UserProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { users: [] });

  const getNextId = (): number => {
    return Math.floor(Math.random() * (1000000 - 100 + 1)) + 100;
  };

  return (
    <UserContext.Provider value={{ state, dispatch, getNextId }}>
      {children}
    </UserContext.Provider>
  );
};
