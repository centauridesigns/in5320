import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell , SingleSelect, SingleSelectOption, Input, Button} from "@dhis2/ui";
import "./Dispense.css";


export function Dispense(props) {
    const { mergedData } = props;
    const [entries, setEntries] = useState([]);

    const handleAddEntry = () => {
        setEntries(prevEntries => [...prevEntries, { id: Date.now(), amount: 0, commodity: "" }]);
    };

    const handleRemoveEntry = (id) => {
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    };

    return(
        <div>
            <h1>Dispense</h1>
            <div>
                {entries.map(entry => (
                    <NewEntry
                        key={entry.id}
                        mergedData={mergedData}
                        onRemove={() => handleRemoveEntry(entry.id)}
                    />
                ))}
                <Button className="button" type="button" onClick={handleAddEntry}>Add</Button>
            </div>
        </div>
    )
}


function NewEntry({mergedData, onRemove}){
    const [amount, setAmount] = useState(0);
    const [selectedCommodity, setSelectedCommodity] = useState("");

    const handleSelectChange = (value) => {
        setSelectedCommodity(value);
        console.log("selected value: ", value.selected);
    };

    const handleAmountChange = (amount) => {
        setAmount(amount);
        console.log("selected amount: ", amount.value);
    };

    return (
        <div>
            <div className="container">
                <div className="leftSide">
                    <SingleSelect className="select" placeholder="Choose a commodity" onChange={handleSelectChange} selected={selectedCommodity.selected}>
                        {mergedData.map((commodity) => 
                            <SingleSelectOption key={commodity.id} label={`${commodity.name} (${commodity.value})`} value={commodity.id} />
                        )
                    }</SingleSelect>
                </div>
                <div className="rightSide">
                    <Input className="numberInput" placeholder="Write amount of packages" type="number" min="0" max="1000" onChange={handleAmountChange}></Input>
                </div>
                <div>
                    <Button className="remove-button" type="button" onClick={onRemove}>X</Button>
                </div>
            </div>
        </div>
    );
}