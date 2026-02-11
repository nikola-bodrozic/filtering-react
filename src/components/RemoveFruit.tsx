import { useFruits } from "../context/FruitsContext";
import { type Fruit } from "../context/types";

const RemoveFruit = () => {
  const { fruits, setFruits } = useFruits();

  const handleRemove = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const fruitId = parseInt(event.currentTarget.id);
    const updatedFruits = fruits.filter((fruit) => fruit.id !== fruitId);
    setFruits(updatedFruits);
  };

  return (
    <div style={{ border: "3px dotted black", padding: "1em" }}>
      <>
        <h3>Remove Fruits</h3>
        <p>Current fruits in context: {fruits.length} items</p>
        <ul>
          {fruits?.map((fruit: Fruit) => (
            <li key={fruit.id}>
              {fruit.category} - {fruit.name} ({fruit.price})
              <button
                id={`${fruit.id}`}
                onClick={handleRemove}
                style={{ backgroundColor: "#ff4444", color: "white" }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {fruits.length === 0 && (
          <p style={{ color: "#999", fontStyle: "italic" }}>
            No fruits to remove
          </p>
        )}
      </>
    </div>
  );
};

export default RemoveFruit;
