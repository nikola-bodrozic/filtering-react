export const sales2024 = [
  { name: "Volkswagen", value: 1000 },
  { name: "BMW", value: 170000 },
  { name: "Mercedes", value: 150000 },
  { name: "Audi", value: 140000 },
  { name: "Ford", value: 100000 },
  { name: "Others", value: 110000 },
];

export interface Car {
    id: number;
    company: string;
    model: string;
    price: string;
    available: boolean;
}

export const cars: Array<Car> = [
  { id: 1, company: 'Toyota', model: 'Corolla', price: '$20000', available: true },
  { id: 2, company: 'Honda', model: 'Civic', price: '$22000', available: true },
  { id: 3, company: 'Ford', model: 'Mustang', price: '$35000', available: false },
  { id: 4, company: 'Tesla', model: 'Model 3', price: '$45000', available: true },
  { id: 5, company: 'Chevrolet', model: 'Camaro', price: '$30000', available: false },
  { id: 6, company: 'BMW', model: 'X3', price: '$42000', available: true },
  { id: 7, company: 'Toyota', model: 'Camry', price: '$28000', available: true },
];
