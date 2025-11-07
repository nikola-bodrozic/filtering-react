import React, { useState, useEffect } from "react";
import { FruitsContext } from "./FruitsContext";
import { type Fruit } from "./types";

interface FruitsProviderProps {
  children: React.ReactNode;
}

export const FruitsProvider: React.FC<FruitsProviderProps> = ({ children }) => {
  const [fruits, setFruits] = useState<Fruit[]>([]);

  useEffect(() => {
    setFruits([
      { id: 1, category: "Fruits", price: "$1", stocked: true, name: "Apple" },
      { id: 2, category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
      { id: 3, category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
      { id: 4, category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
      { id: 5, category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
      { id: 6, category: "Vegetables", price: "$1", stocked: true, name: "Peas" }
    ]);
  }, []);

  return (
    <FruitsContext.Provider value={{ fruits, setFruits }}>
      {children}
    </FruitsContext.Provider>
  );
};
