import { useFruits } from "../context/FruitsContext";
const apartments = [
  { id: 1, category: "Studio", price: "$1200", stocked: true, name: "Maple Heights" },
  { id: 2, category: "1 Bedroom", price: "$1500", stocked: true, name: "Cedar Lofts" },
  { id: 3, category: "2 Bedroom", price: "$2200", stocked: false, name: "Willow Residences" },
  { id: 4, category: "1 Bedroom", price: "$1600", stocked: true, name: "Oak Commons" },
  { id: 5, category: "3 Bedroom", price: "$3000", stocked: false, name: "Pine Towers" },
  { id: 6, category: "Studio", price: "$1100", stocked: true, name: "Birch Gardens" }
];

const Filter = () => {
  const { fruits, setFruits } = useFruits();
  const handleAdd = () => {
    setFruits(prev => [...prev, { "id": 115, "category": "Vegetables", "price": "$4", "stocked": false, "name": "Pumpkin" }])
  };

  console.log("Filter", new Date().toISOString(), JSON.stringify(fruits[0]));
  return (
    <div style={{ border: "3px dotted black", padding: "1em" }}>
      <>
        From context: {JSON.stringify(fruits)}
        <ul>
          {apartments?.map((item, index) => (
            <li key={index}>{item.name} - {item.category}</li>
          ))}
        </ul>
        <button onClick={handleAdd}>Add</button>
      </>
    </div>
  );
};

export default Filter;
