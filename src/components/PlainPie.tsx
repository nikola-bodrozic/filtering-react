import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export interface ManufacturerData {
  value: number;
  [key: string]: string | number;
}

export interface CarSalesDataProps {
  data: ManufacturerData[];
  title: string;
}

//recevive object as prop in Child
const PlainPie = ({data, title}: CarSalesDataProps) => {
  return (
    <div style={{ border: "3px dotted black", padding: "1em" }}>
      <h1>{title}</h1>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => `${entry.name ?? ''}: ${entry.value?.toLocaleString() ?? 0}`}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF", "#FF6E6E"][index % 6]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
      </PieChart>
    </div>
  );
}

export default PlainPie ;
