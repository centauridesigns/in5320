import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell , SingleSelect, SingleSelectOption, Input, Button} from "@dhis2/ui";
import { IconCross24, IconAdd24 } from "@dhis2/ui-icons"
import "./Dispense.css";


export function Dispense(props) {
    const { mergedData } = props;
    const [entries, setEntries] = useState([]);

        useEffect(() => {
        console.log("Saved commodities:", entries);
    }, [entries]);

    // Handles addition of new input fields. The ID is the current date to ensure no duplicate keys.
    const handleAddEntry = () => {
        setEntries(prevEntries => [...prevEntries, { id: Date.now(), amount: 0, commodity: "" }]);
    };

    // Handles removal of existing input fields.
    const handleRemoveEntry = (id) => {
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    };

    // Handles input fields. When a commodity is deselected, subsequent input fields are allowed to contain said commodity.
    const handleCommodityChange = (id, commodityId, amount) => {
        setEntries(prevEntries => prevEntries.map(entry => {
            if (entry.id === id) {
                return { ...entry, commodity: commodityId, amount: amount };
            }
            return entry;
        }));
    };

    return(
        <div>
            <h1>Dispense</h1>
            <div>
                {entries.map(entry => (
                    <NewEntry
                        key={entry.id}
                        id={entry.id}
                        mergedData={mergedData}
                        onRemove={() => handleRemoveEntry(entry.id)}
                        onCommodityChange={handleCommodityChange}
                    />
                ))}
                <Button className="remove-button" type="button" onClick={handleAddEntry}><IconAdd24/></Button>
            </div>
        </div>
    )
}

function NewEntry({id, mergedData, onRemove, onCommodityChange}){
    const [amount, setAmount] = useState(0);
    const [selectedCommodity, setSelectedCommodity] = useState("");

    const handleSelectChange = (value) => {
        setSelectedCommodity(value);
        onCommodityChange(id, value, amount);
    };

    const handleAmountChange = (event) => {
        setAmount(event.value);
        onCommodityChange(id, selectedCommodity, event.value);
    };

    return (
        <div>
            <div className="controls">
                <div className="small-dropdown">
                    <SingleSelect className="select" placeholder="Commodity" onChange={handleSelectChange} selected={selectedCommodity.selected}>
                        {mergedData.map((commodity) => 
                            <SingleSelectOption key={commodity.id} label={`${commodity.name} (${commodity.value})`} value={commodity.id} />
                        )}
                    </SingleSelect>
                </div>
                <div className="amount">
                    <Input className="numberInput" placeholder="# of packages" type="number" min="0" max="1000" onChange={handleAmountChange}></Input>
                </div>
                <div>
                    <Button className="add-button" type="button" onClick={onRemove}><IconCross24/></Button>
                </div>
            </div>
        </div>
    );
}
