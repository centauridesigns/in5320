import React, { useState, useEffect } from "react";
import { useDataQuery , useDataMutation} from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell , SingleSelect, SingleSelectOption, Input, Button} from "@dhis2/ui";
import { IconCross24, IconAdd24 } from "@dhis2/ui-icons"
import "./Dispense.css";
import { postDispenseTransaction} from "./api.js";

const request = {
    dataSet: "ULowA8V3ucd",
    resource:"/dataValueSets/",
    completeDate: "2023-10-19",   //dateIso
    type: "create",
    data: {
       orgUnit: "XtuhRhmbrJM",
       period: "202310",    //period
       //have to map later
       dataValues: [
           {
           dataElement: "Boy3QwztgeZ",  //commodityId
           categoryOptionCombo: "J2Qf1jtZuj8",
           value: "33"  //amount 
            }
        ]
    }
}


export function Dispense(props) {
    const [mutate, { mutateLoading, mutateError }] = useDataMutation(
        postDispenseTransaction()
    );
    const { mergedData } = props;
    const [entries, setEntries] = useState([{
        id: Date.now(), amount: 0, commodity: ""
    }]);
    const [dispenseTransactionArray, setDispenseTransactionArray] = useState([])

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
            <div className="commodity-controls">
                {entries.map(entry => (
                    <NewEntry
                        key={entry.id}
                        id={entry.id}
                        mergedData={mergedData}
                        onRemove={() => handleRemoveEntry(entry.id)}
                        onCommodityChange={handleCommodityChange}
                    />
                ))}
                <Button className="add-button" type="button" onClick={handleAddEntry}><IconAdd24/> Add commodity</Button>
                <p className="desc">Click on this button to add another commodity to this transaction</p>
            </div>
            <div className="recipient-controls">
                <Button className="testing" type="button" onClick={(e) => {
                    setDispenseTransactionArray([{
                        categoryOptionCombo: "J2Qf1jtZuj8",
                        dataElement: ""
                    }])

                    mutate({
                        dispenseMutation: dispenseTransactionArray,
                    }).then(function (response) {
                            if (response.response.status !== "SUCCESS") {
                                success = false
                                console.log(response);
                            }
                    })
                }}>Post</Button>
            </div>
        </div>
    )
}

function NewEntry({id, mergedData, onRemove, onCommodityChange}){
    const [amount, setAmount] = useState(0);
    const [selectedCommodity, setSelectedCommodity] = useState("");

    const handleSelectChange = (value) => {
        setSelectedCommodity(value.selected);
        onCommodityChange(id, value.selected, amount);
    };

    const handleAmountChange = (event) => {
        setAmount(event.value);
        onCommodityChange(id, selectedCommodity, event.value);
    };

    return (
        <div>
            <div className="controls">
                <div className="section">
                    <p className="title">Commodity</p>
                    <div className="small-dropdown">
                        <SingleSelect className="select" placeholder="Commodity" onChange={handleSelectChange} selected={selectedCommodity}>
                            {mergedData.map((commodity) => 
                                <SingleSelectOption key={commodity.id} label={`${commodity.name} (${commodity.value})`} value={commodity.id} />
                            )}
                        </SingleSelect>
                    </div>
                    <p className="desc">Select the commodity you want to dispense</p>
                </div>
                <div className="section">
                    <p className="title">Quantity</p>
                    <div className="amount">
                        <Input className="numberInput" placeholder="# of packages" type="number" min="0" max="1000" onChange={handleAmountChange}></Input>
                    </div>
                    <p className="desc">Write or add the amount of packages you want to dispense</p>
                </div>
                <div>
                    <div className="empty-title"></div>
                    <div>
                        <Button className="remove-button" type="button" onClick={onRemove}><IconCross24/></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
