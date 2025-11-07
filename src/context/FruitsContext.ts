import { createContext, useContext } from "react";
import { type Fruit } from "./types";

export interface FruitsContextType {
  fruits: Fruit[];
  setFruits: React.Dispatch<React.SetStateAction<Fruit[]>>;
}

export const FruitsContext = createContext<FruitsContextType | undefined>(undefined);

// Custom hook for safer usage
export const useFruits = (): FruitsContextType => {
  const context = useContext(FruitsContext);
  if (!context) throw new Error("useFruits must be used within a FruitsProvider");
  return context;
};
