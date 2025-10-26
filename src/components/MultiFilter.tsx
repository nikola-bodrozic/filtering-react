import { useState } from 'react';

export interface Shipment {
    id: number;
    type: string;
    origin: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const shipments: Shipment[] = [
    { id: 1, type: "bananas", origin: "Ecuador" },
    { id: 2, type: "apples", origin: "USA" },
    { id: 3, type: "oranges", origin: "Spain" },
    { id: 4, type: "grapes", origin: "Italy" },
    { id: 5, type: "mangoes", origin: "India" },
    { id: 6, type: "pineapples", origin: "Costa Rica" },
    { id: 7, type: "apples", origin: "Poland" },
];
const MultiFilter = () => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [delivery, setDelivery] = useState<Shipment[]>(shipments);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const optionsCollection = event.target.selectedOptions; // HTMLCollection
        const optionsArray = Array.from(optionsCollection);    // Convert to array
        const selectedValues = optionsArray.map(option => option.value); // Extract values
        setSelectedOptions(selectedValues);
        // const filteredShipments = []
        // for(const sh of shipments) {
        //    for (const v of selectedValues) {
        //     if (sh.type === v) {
        //         filteredShipments.push(sh);
        //     }
        //    }
        // }
        //or
        const filteredShipments = shipments.filter(sh => selectedValues.includes(sh.type));
        console.log(filteredShipments);
        setDelivery(filteredShipments);
    };
    const fruits = new Set<string>(shipments.map((s: Shipment) => s.type));
    return (
        <div style={{ border: "3px dotted black", padding: "1em" }}>
            <label htmlFor="my-multi-select">Choose multiple options:</label>
            <select
                id="my-multi-select"
                multiple={true} // Enable multiple selection
                value={selectedOptions} // Bind selected options to state
                onChange={handleSelectChange} // Handle changes
            >
                {[...fruits].map(
                    (fruit) => (
                        <option key={fruit} value={fruit}>
                            {fruit}
                        </option>
                    )
                )}
            </select>
            <ul>
                {delivery.map((d) => (<li key={d.id}>{d.type} {d.origin}</li>))}
            </ul>
        </div>
    );
};

export default MultiFilter;