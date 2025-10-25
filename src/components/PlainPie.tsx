import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface SalesDataProps {
  data: { name: string; value: number }[];
  title: string;
}

// receive object as prop
const PlainPie = ({ data, title }: SalesDataProps) => {
  return (
    <>
      <h1>{title}</h1>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={(entry) => `${entry.name ?? ''}: ${entry.value?.toLocaleString() ?? 0}`}
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF", "#FF6E6E"][index % 6]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
      </PieChart>
    </>
  );
}

export default PlainPie ;
