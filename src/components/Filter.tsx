import { useState, useEffect } from 'react';

interface Product {
    category: string;
    price: string;
    stocked: boolean;
    name: string;
}

const cars: Product[] = [
    { category: "Fruits", price: "$1", stocked: true, name: "Apple" },
    { category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
    { category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
    { category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
    { category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
    { category: "Vegetables", price: "$1", stocked: true, name: "Peas" }
]

const Filter = () => {
    const [input, setInput] = useState("")
    const [items, setItems] = useState<Product[] | null>(null)
    const [inStockOnly, setInStockOnly] = useState(false);

    useEffect(() => {
        let filtered: Product[] = [];
        if (input === "") {
            filtered = [...cars];
        } else {
            filtered = cars.filter((p: Product) => {
                const n = input.toLowerCase()
                const h = p.name.toLowerCase()
                return h.includes(n)
            })
        }
        if (inStockOnly) {
            filtered = filtered.filter((p: Product) => p.stocked === inStockOnly)
        }
        setItems([...filtered])
    }, [input, inStockOnly])

    return (
        <div>
            <input type="text" value={input} name="txtInput" onChange={(e) => { setInput(e.target.value) }} />
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />in stock
            <ul>
                {items?.map((item, index) => {
                    return <li key={index}>{item.name}</li>
                })}
            </ul>
        </div>
    );
};

export default Filter;
