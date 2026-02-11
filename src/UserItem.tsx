import { type User, useUsers } from "./context/UserProvider";

export const UserItem: React.FC<{ user: User }> = ({ user }) => {
  const { updateUser, removeUser } = useUsers();

  const updateField = (field: "name" | "email", value: string) => {
    updateUser(user.id, field, value);
  };

  const remove = () => {
    removeUser(user.id);
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
        name="name"
        value={user.name}
        onChange={(e) => updateField("name", e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={(e) => updateField("email", e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <button onClick={remove}>Remove</button>
    </div>
  );
};