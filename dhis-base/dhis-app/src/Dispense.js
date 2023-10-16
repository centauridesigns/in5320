import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell , SingleSelect, SingleSelectOption} from "@dhis2/ui";


export function Dispense(props) {
    const { mergedData } = props;
    //console.log("Merged Data in Dispense:", mergedData);

    const [commodity, setSelectedCommodity] = useState("");

    const handleSelectChange = (value) => {
        setSelectedCommodity(value);
        console.log("selected value: ", value);
    };

    return (
        <div>
            <h1>Dispense</h1>
            <SingleSelect className="select" placeholder="Choose a commodity" onChange={handleSelectChange}>{
                mergedData.map((commodity) => 
                    <SingleSelectOption key={commodity.id} label={`${commodity.name} (${commodity.value})`} value={commodity.id} />
                )
            }</SingleSelect>
        </div>
    );
}