import { memo } from "react";
import isEqual from "lodash.isequal";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepCompare = (prevProps: any, nextProps: any) => {
    return isEqual(prevProps, nextProps);
};

export default function App() {
  const MemoPie = memo(PlainPie, deepCompare);
  return (
    <div style={{ textAlign: "center" }}>
      <FruitsProvider>
          {/* pass array as prop */}
          <MemoPie data={sales2024} title="Car Sales by Manufacturer" />
          <hr />
          <Filter />
      </FruitsProvider>
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
