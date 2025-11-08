import { useState, useEffect } from 'react';
import { type Fruit } from "../context/types";
import { useFruits } from "../context/FruitsContext";

const Filter = () => {
    const [input, setInput] = useState("")
    const [items, setItems] = useState<Fruit[] | null>(null)
    const [inStockOnly, setInStockOnly] = useState(false);
    const { fruits, setFruits } = useFruits();

    useEffect(() => {
        let filtered: Fruit[] = [];
        if (input === "") {
            filtered = [...fruits];
        } else {
            filtered = fruits.filter((p: Fruit) => {
                const n = input.toLowerCase()
                const h = p.name.toLowerCase()
                return h.includes(n)
            })
        }
        if (inStockOnly) {
            filtered = filtered.filter((p: Fruit) => p.stocked === inStockOnly)
        }
        setItems([...filtered])
    }, [input, inStockOnly, fruits])

    const handleAdd = () => {
        setFruits([
            ...fruits,
            { id: 100, category: "Vegetables", price: "$100", stocked: true, name: "New Fruit" }
        ]);
    };

  return (
    <div style={{ border: "3px dotted black", padding: "1em" }}>
      {!fruits || fruits.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <>
          <input
            type="text"
            value={input}
            name="txtInput"
            onChange={(e) => setInput(e.target.value)}
          />
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          in stock
          <ul>
            {items?.map((item, index) => (
              <li key={index}>{item.name}</li>
            ))}
          </ul>
          <button onClick={handleAdd}>Add</button>
        </>
      )}
    </div>
  );
};

export default Filter;
