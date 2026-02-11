import { useFruits } from "../context/FruitsContext";
import { type Fruit } from "../context/types";

const Filter = () => {
  const { fruits, setFruits } = useFruits();
  const handleAdd = () => {
    const id =  Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
    setFruits(prev => [...prev, { "id": id, "category": "Vegetables", "price": "$4", "stocked": false, "name": "Pumpkin" }])
  };

  return (
    <div style={{ border: "3px dotted black", padding: "1em" }}>
      <>
        <ul>
          {fruits?.map((fruit: Fruit) => (
            <li key={fruit.id}>{fruit.category} - {fruit.name} ({fruit.price}) </li>
          ))}
        </ul>
        <button onClick={handleAdd}>Add</button>
      </>
    </div>
  );
};

export default Filter;
