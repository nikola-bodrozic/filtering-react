export type Fruit = {
  id: number;
  category: string;
  price: string;
  stocked: boolean;
  name: string;
}

export type User = {
  id: number;
  name: string;
  email: string;
};

export type State = {
  users: User[];
  loading: boolean;
  error: string | null;
};

export type Action =
  | { type: "setUsers"; users: User[] }
  | { type: "addUser"; user: User }
  | { type: "updateUser"; id: number; field: "name" | "email"; value: string }
  | { type: "removeUser"; id: number }
  | { type: "setLoading"; loading: boolean }
  | { type: "setError"; error: string | null };

