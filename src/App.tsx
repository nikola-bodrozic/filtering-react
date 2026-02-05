import { memo, useState } from "react";
import { cloneDeep, isEqual } from 'lodash';
import { FruitsProvider } from "./context/FruitsProvider";
import PlainPie from "./components/PlainPie";
import Filter from "./components/Filter";
import "./App.css";
import { sales2024 } from "./components/values";
import AdvancedFilter from "./components/AdvancedFilter";
import MultiFilter from "./components/MultiFilter";
import TwoInputFields from "./components/TwoInputFields";
import { UserProvider } from "./context/UserProvider";
import { UserForm } from "./components/UserForm";
import { UserList } from "./components/UserList";
import UsersGrid from "./components/UsersGrid";
import FilterMap from "./components/FilterMap";
import { type User } from "./components/values";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepCompare = (prevProps: any, nextProps: any) => {
  return isEqual(prevProps, nextProps);
};

export default function App() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Alice', profile: { city: 'Paris', profession: 'Engineer' } },
    { id: 2, name: 'Bob', profile: { city: 'London', profession: 'Designer' } },
    { id: 3, name: 'Charlie', profile: { city: 'New York', profession: 'Teacher' } },
    { id: 4, name: 'Diana', profile: { city: 'Tokyo', profession: 'Developer' } },
  ]);

  const MemoPie = memo(PlainPie, deepCompare);

  const handleEdit = (user: User, id: number) => {
    const newName = prompt("Modify name", user.name);
    const newCity = prompt("Modify city", user.profile.city);
    if (newName === null || newCity === null) return;

    const clonedUsers = cloneDeep(users);
    const found = clonedUsers.find((user: User) => user.id === id);
    if (found) {
      found.name = newName;
      found.profile.city = newCity;
    }
    setUsers(clonedUsers);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* pass array and function as prop */}
      <UsersGrid data={users} onEdit={handleEdit} />
      <FruitsProvider>
        {/* pass array as prop */}
        <MemoPie data={sales2024} title="Car Sales by Manufacturer" />
        <hr />
        <Filter />
      </FruitsProvider>
      <FilterMap />
      <hr />
      <AdvancedFilter />
      <hr />
      <MultiFilter />
      <hr />
      <TwoInputFields />
      <hr />
      <UserProvider>
        <div style={{ border: "3px dotted black", padding: "1em" }}>
          <h2>Context + Reducer: Array of Objects Example</h2>
          <UserForm />
          <UserList />
        </div>
      </UserProvider>
    </div>
  );
}
