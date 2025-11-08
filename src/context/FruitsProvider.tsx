import React, { useState, useEffect } from "react";
import { FruitsContext } from "./FruitsContext";
import { type Fruit } from "./types";

interface FruitsProviderProps {
  children: React.ReactNode;
}

export const FruitsProvider: React.FC<FruitsProviderProps> = ({ children }) => {
  const [fruits, setFruits] = useState<Fruit[]>([]);

  useEffect(() => {
    const fetchFruits = async () => {
      // Fetch fruits from your API or any other source
      // and set it to the state
      const fetchedFruits = [
        { id: 1, category: "Fruits", price: "$1", stocked: true, name: "Apple" },
        { id: 2, category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
        { id: 3, category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
        { id: 4, category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
        { id: 5, category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
        { id: 6, category: "Vegetables", price: "$1", stocked: true, name: "Peas" }
      ];
      setFruits(fetchedFruits);
    };

    setTimeout(fetchFruits, 2000); // simulate a 2 second delay
  }, []);

  return (
    <FruitsContext.Provider value={{ fruits, setFruits }}>
      {children}
    </FruitsContext.Provider>
  );
};
