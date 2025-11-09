import React from "react";
import { useUsers } from "../context/UserProvider";

export const UserForm: React.FC = () => {
  const { addUser } = useUsers();

  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={addUser}>Add User</button>
    </div>
  );
};
