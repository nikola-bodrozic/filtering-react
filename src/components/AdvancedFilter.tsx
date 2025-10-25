import { useState, useEffect } from 'react';
import { cars } from './values';

const AdvancedFilter = () => {
    const [input, setInput] = useState('');
    const [selectedMake, setSelectedMake] = useState('');
    const [filteredCars, setFilteredCars] = useState(cars);

    const companies = new Set<string>(cars.map((c) => c.company));

    useEffect(() => {
        let filteredCars = cars;
        if (selectedMake !== '') filteredCars = filteredCars.filter((car) => car.company === selectedMake);
        if (input !== '') filteredCars = filteredCars.filter((c) => c.model.toLowerCase().includes(input.toLowerCase()));
        setFilteredCars(filteredCars);
    }, [input, selectedMake]);

    return (
        <div style={{ border: "3px dotted black", padding: "1em" }}>
            <div>
                <label htmlFor="make-select">Filter by Make: </label>
                <select
                    id="make-select"
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                >
                    <option value="">All Makes</option>
                    {[...companies].map(
                        (c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        )
                    )}
                </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="model-input">Search by Model: </label>
                <input
                    id="model-input"
                    type="text"
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                />
            </div>

            <ul>
                {filteredCars.map((car) => (
                    <li key={car.id}>
                        {car.company} {car.model} - {car.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdvancedFilter;
