import { useState } from 'react';
import { cars, type Car } from './values';

const TwoInputFields = () => {
    const [company, setCompany] = useState('');
    const [model, setModel] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'company') setCompany(e.target.value);
        if (e.target.name === 'model') setModel(e.target.value);
    };
    let filtered: Car[] = [...cars];
    filtered = filtered.filter((item: Car) => 
        item.company.toLowerCase().includes(company.toLowerCase()) 
        && item.model.toLowerCase().includes(model.toLowerCase()))

    return (
        <div style={{ border: "3px dotted black", padding: "1em" }}>
            <input type="text" name="company" value={company} onChange={handleChange} placeholder="Company" />
            <input type="text" name="model" value={model} onChange={handleChange} placeholder="Model" />
            <ul>
                {filtered.map((car) => (
                    <li key={car.id}>
                        {car.company} {car.model} - {car.price}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TwoInputFields