import { type User, useUsers } from "./context/UserProvider";

export const UserItem: React.FC<{ user: User; }> = ({ user }) => {
  const { dispatch } = useUsers();

  const updateField = (field: "name" | "email", value: string) => {
    dispatch({ type: "updateUser", id: user.id, field, value });
  };

  const remove = () => {
    dispatch({ type: "removeUser", id: user.id });
  };

  return (
    <div
      style={{
        border: "1px solid gray",
        borderRadius: 6,
        padding: "10px",
        marginBottom: "10px",
      }}
    >
      <input
        type="text"
        value={user.name}
        onChange={(e) => updateField("name", e.target.value)}
        style={{ marginRight: "10px" }} />
      <input
        type="email"
        value={user.email}
        onChange={(e) => updateField("email", e.target.value)}
        style={{ marginRight: "10px" }} />
      <button onClick={remove}>Remove</button>
    </div>
  );
};
