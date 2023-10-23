import React, { useState, useEffect } from "react";
import { useDataQuery , useDataMutation} from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell , SingleSelect, SingleSelectOption, Input, Button} from "@dhis2/ui";
import { IconCross24, IconAdd24 , IconCheckmark24} from "@dhis2/ui-icons"
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
    const [commodityConsumptionArr, setCommodityConsumptionArr] = useState([]);
    const [commodityTotalAmountArr, setCommodityTotalAmountArr] = useState([]);

    useEffect(() => {
        console.log("Saved commodities:", entries);
    }, [entries]);

    // Handles addition of new input fields. The ID is the current date to ensure no duplicate keys.
    const handleAddEntry = () => {
        setEntries(prevEntries => [...prevEntries, { id: Date.now(), amount: 0, commodity: "" }]);
    };

    // Handles removal of existing input fields.
    const handleRemoveEntry = (commodity) => {
        const id = commodity.id
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
        setCommodityConsumptionArr(prevEntries => prevEntries.filter(entry => entry.dataElement !== commodity.commodity));
        setCommodityTotalAmountArr(prevEntries => prevEntries.filter(entry => entry.dataElement !== commodity.commodity));
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

    // Handles confirmation of entry
    const handleConfirmEntry = (entry) => {
        setCommodityConsumptionArr([...commodityConsumptionArr, {
            categoryOptionCombo: "J2Qf1jtZuj8",
            dataElement: entry.commodity,
            period: "202310", 
            orgUnit: "XtuhRhmbrJM",
            value: entry.amount
        }])

        let oldValue = 0;
        mergedData.map((c) => {
            if (c.id == entry.commodity){
                oldValue = c.value
            }
        })

        setCommodityTotalAmountArr([...commodityTotalAmountArr, {
            categoryOptionCombo: "J2Qf1jtZuj8",
            dataElement: entry.commodity,
            period: "202310", 
            orgUnit: "XtuhRhmbrJM",
            value: oldValue - entry.amount
        }])
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
                        onRemove={() => handleRemoveEntry(entry)}
                        onCommodityChange={handleCommodityChange}
                        onConfirm={() => handleConfirmEntry(entry)}
                    />
                ))}
                <Button className="add-button" type="button" onClick={handleAddEntry}><IconAdd24/> Add commodity</Button>
                <p className="desc">Click on this button to add another commodity to this transaction</p>
            </div>
            <div className="recipient-controls">
                <Button className="testing" type="button" onClick={(e) => {
                    mutate({
                        dispenseMutation: commodityTotalAmountArr,
                    }).then(function (response) {
                            if (response.response.status !== "SUCCESS") {
                                success = false
                                console.log(response);
                            }
                    })
                }}>Verify</Button>
            </div>
        </div>
    )
}

function NewEntry({id, mergedData, onRemove, onCommodityChange, onConfirm}){
    const [amount, setAmount] = useState(0);
    const [selectedCommodity, setSelectedCommodity] = useState("");
    const [inputDisabled, setInputDisabled] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(true)

    const handleSelectChange = (value) => {
        setSelectedCommodity(value.selected);
        onCommodityChange(id, value.selected, amount);
    };

    const handleAmountChange = (event) => {
        setAmount(event.value);
        onCommodityChange(id, selectedCommodity, event.value);
    };

    const handleConfirm = () => {
        setInputDisabled(true);
        setButtonVisible(false);
        onConfirm();
    }

    return (
        <div>
            <div className="controls">
                <div className="section">
                    <p className="title">Commodity</p>
                    <div className="small-dropdown">
                        <SingleSelect disabled={inputDisabled} className="select" placeholder="Commodity" onChange={handleSelectChange} selected={selectedCommodity}>
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
                        <Input disabled={inputDisabled} className="numberInput" placeholder="# of packages" type="number" min="0" max="1000" onChange={handleAmountChange}></Input>
                    </div>
                    <p className="desc">Write or add the amount of packages you want to dispense</p>
                </div>
                <div>
                    <div className="empty-title"></div>
                    <div>
                        {buttonVisible && (<Button className="confirm-button" type="button" onClick={handleConfirm}><IconCheckmark24/></Button>)}
                        <Button className="remove-button" type="button" onClick={onRemove}><IconCross24/></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
