import { memo, useState, type SyntheticEvent } from "react";
import { cloneDeep, isEqual } from "lodash";
import { FruitsProvider } from "./context/FruitsProvider";
import PlainPie, { type CarSalesDataProps } from "./components/PlainPie";
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
import { EditUserOverlay } from "./components/EditUserOverlay";

const MemoPie = memo(
  PlainPie,
  (prevProps: CarSalesDataProps, nextProps: CarSalesDataProps) =>
    isEqual(prevProps, nextProps),
);
const MemoFilter = memo(Filter);

export default function App() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Alice",
      profile: { city: "Paris", profession: "Engineer" },
    },
    {
      id: 2,
      name: "Bob",
      profile: { city: "London", profession: "Designer" },
    },
    {
      id: 3,
      name: "Charlie",
      profile: { city: "New York", profession: "Teacher" },
    },
    {
      id: 4,
      name: "Diana",
      profile: { city: "Tokyo", profession: "Developer" },
    },
  ]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    profession: "",
  });

  const handleEdit = (user: User, id: number) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      city: user.profile.city,
      profession: user.profile.profession,
    });
    setShowOverlay(true);
    console.log(user, id);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setEditingUser(null);
    setFormData({ name: "", city: "", profession: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    // Log form values
    console.log("Form submitted with values:", formData);
    console.log("Editing user ID:", editingUser?.id);

    if (!editingUser) return;

    // Update the user
    const clonedUsers = cloneDeep(users);
    const found = clonedUsers.find((user: User) => user.id === editingUser.id);
    if (found) {
      found.name = formData.name;
      found.profile.city = formData.city;
      found.profile.profession = formData.profession;
    }
    setUsers(clonedUsers);

    // Show confirmation alert
    alert(`User updated:
Name: ${formData.name}
City: ${formData.city}
Profession: ${formData.profession}`);

    handleCloseOverlay();
  };

  return (
    <div style={{ textAlign: "center" }}>
      {showOverlay && (
        <EditUserOverlay
          editingUser={editingUser}
          formData={formData}
          onClose={handleCloseOverlay}
          onSubmit={handleFormSubmit}
          onInputChange={handleInputChange}
        />
      )}

      <UsersGrid data={users} onEdit={handleEdit} />

      <FruitsProvider>
        <MemoPie data={sales2024} title="Car Sales by Manufacturer" />
        <hr />
        <MemoFilter />
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
