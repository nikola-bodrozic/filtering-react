import React from "react";
import { useUsers } from "../context/UserProvider";

export const UserList: React.FC = () => {
  const { state, removeUser } = useUsers();

  if (state.loading) return <p>Loading users...</p>;
  if (state.error) return <p style={{ color: "red" }}>{state.error}</p>;

  return (
    <ul>
      {state.users.map(u => (
        <li key={u.id}>
          {u.name} ({u.email}){" "}
          <button onClick={() => removeUser(u.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};
