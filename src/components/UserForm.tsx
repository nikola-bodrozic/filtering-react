import { useUsers } from "../context/UserProvider";

export const UserForm: React.FC = () => {
  const { dispatch, getNextId } = useUsers();

  const addUser = () => {
    const id = getNextId();
    dispatch({
      type: "addUser",
      user: { id, name: `User ${id}`, email: `user${id}@mail.com` },
    });
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={addUser}>Add User</button>
    </div>
  );
};
