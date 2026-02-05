import { memo, useState, useEffect } from "react";
import { cloneDeep, isEqual } from "lodash";
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
// import FilterMap from "./components/FilterMap";
import { type User } from "./components/values";
import ProductCard from "./components/ProductCard";
import axios from "axios";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

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
  useEffect(() => {
    // Create AbortController
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://test.nikolabodr.com/get.php",
          {
            signal: controller.signal,
          },
        );
        setData(response.data[0]);
      } catch (error) {
        if (axios.isCancel(error)) {
          if (error.message) console.log("Request canceled:", error.message);
        } else {
          console.error("API Error:", error);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

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
      {/* <FilterMap /> */}
      <hr />
      <AdvancedFilter />
      <hr />
      <MultiFilter />
      <hr />
      <TwoInputFields />
      {data ? (
        <ProductCard
          title={data.name}
          description={data.description}
          price={{
            unit_amount: data.prices[0].unit_amount / 100,
            currency: data.prices[0].currency.toUpperCase() as string,
          }}
        />
      ) : (
        <p>{"Loading..."}</p>
      )}
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
