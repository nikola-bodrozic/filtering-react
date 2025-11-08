import { UserItem } from "../UserItem";
import { useUsers } from "../context/UserProvider";

export const UserList: React.FC = () => {
  const { state } = useUsers();
  return (
    <div>
      {state.users.length === 0 ? (
        <p>No users yet.</p>
      ) : (
        state.users.map((user) => <UserItem key={user.id} user={user} />)
      )}
    </div>
  );
};
