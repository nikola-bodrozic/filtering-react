import { memo } from "react";
import isEqual from "lodash.isequal";
import PlainPie from "./components/PlainPie";
import Filter from "./components/Filter";
import "./App.css";
import { sales2024 } from "./components/values";
import AdvancedFilter from "./components/AdvancedFilter";
import MultiFilter from "./components/MultiFilter";
import TwoInputFields from "./components/TwoInputFields";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepCompare = (prevProps: any, nextProps: any) => {
    return isEqual(prevProps, nextProps);
};

export default function App() {
  const MemoPie = memo(PlainPie, deepCompare);
  return (
    <div style={{ textAlign: "center" }}>
      {/* pass array as prop */}
      <MemoPie data={sales2024} title="Car Sales by Manufacturer" />
      <hr />
      <Filter />
      <hr />
      <AdvancedFilter />
      <hr />
      <MultiFilter />
      <hr />
      <TwoInputFields />
    </div>
  );
}
