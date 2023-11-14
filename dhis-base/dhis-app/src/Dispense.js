import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip, Calendar, CalendarInput } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconCheckmark24, IconCheckmarkCircle24, IconCheckmarkCircle16, IconUndo24} from "@dhis2/ui-icons"
import "./Dispense.css";
import { getData, postDispenseTransaction, postNewTransaction } from "./api.js";
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"


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
  const { loading, error, data } = useDataQuery(getData());
  const [dispenser, setDispenser] = useState("");
  const [recipient, setRecipient] = useState("");
  const [modalHidden, setModalHidden] = useState(true);
  const [dispenserError, setDispenserError] = useState(false);
  const [recipientError, setRecipientError] = useState(false);
  const [confirmedEntries, setConfirmedEntries] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [transactionArr, setTransactionArr] = useState([]);
  const [mutateTransaction, { mutateLoadingTransaction, mutateErrorTransaction }] = useDataMutation(
    postNewTransaction()
  );

  // Handles addition of new input fields. The ID is the current date to ensure no duplicate keys.
  const handleAddEntry = () => {
    setEntries(prevEntries => [...prevEntries, { id: Date.now(), amount: 0, commodity: "" }]);
  };

  function clearAll() {
    setCommodityConsumptionArr([]);
    setCommodityTotalAmountArr([]);
    setEntries([{
      id: Date.now(), amount: 0, commodity: ""
    }]);
    setDispenser("");
    setRecipient("");
  }

  // Handles removal of existing input fields.
  const handleRemoveEntry = (commodity) => {
    const id = commodity.id
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    setCommodityConsumptionArr(prevEntries => prevEntries.filter(entry => entry.dataElement !== commodity.commodity));
    setCommodityTotalAmountArr(prevEntries => prevEntries.filter(entry => entry.dataElement !== commodity.commodity));
    setConfirmedEntries(prev => {
      const { [commodity.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const setConfirmedForEntry = (entryId, isConfirmed) => {
    setConfirmedEntries(prev => ({ ...prev, [entryId]: isConfirmed }));
  };

  // Handles input fields. When a commodity is deselected, subsequent input fields are allowed to contain said commodity.
  const handleCommodityChange = (id, commodityId, amount) => {
    if (!commodityId || amount === 0 || amount === "") { }

    else {
      setEntries(prevEntries => prevEntries.map(entry => {
        if (entry.id === id) {
          return { ...entry, commodity: commodityId, amount: amount };
        }
        return entry;
      }));
    }
  };

  // Handles confirmation of entry
  const handleConfirmEntry = (entry) => {
    if (!entry.commodity || entry.amount === 0 || entry.amount === "") { }
    else {
        setCommodityConsumptionArr([...commodityConsumptionArr, {
            categoryOptionCombo: "J2Qf1jtZuj8",
            dataElement: entry.commodity,
            period: "202310",
            orgUnit: "XtuhRhmbrJM",
            value: entry.amount
        }])

        let oldValue = 0;
        mergedData.map((c) => {
            if (c.id == entry.commodity) {
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

        setTransactionArr([...transactionArr, {
            id: entry.commodity,
            name: getCommodityName(entry.commodity, mergedData),
            newValue: parseInt(oldValue) - parseInt(entry.amount),
            oldValue: parseInt(oldValue),
        }])
    }
  };

  useEffect(() => {
    console.log("Saved commodities:", entries);
  }, [entries]);

  if (data) {
    return (
      <div>
        {<h1>Dispense</h1>}
        {showAlert && (
          <AlertBar
            duration={200}
            onHidden={() => setShowAlert(false)}
            warning>
            Please confirm all of the commodity entries you would like to add to the transaction.
          </AlertBar>
        )}
        {/*Commodity container.*/}
        <div className="commodity-controls">
          {entries.map((entry, index) => (
            <NewEntry
              key={entry.id}
              index={index}
              id={entry.id}
              mergedData={mergedData}
              onRemove={() => handleRemoveEntry(entry)}
              onCommodityChange={handleCommodityChange}
              onConfirm={() => handleConfirmEntry(entry)}
              setConfirmedForEntry={setConfirmedForEntry}
            />
          ))}
          <Button className="icon-button" type="button" onClick={handleAddEntry}><IconAdd24 /> Add Commodity</Button>
          <p className="desc">Add another commodity.</p>
        </div>

        {/*Dispenser and recipient select */}
        <div className="controls">
          <div className="section">
            <h4 className="title">Dispenser</h4>
            <div className="small-dropdown">
              <SingleSelect
                error={dispenserError}
                filterable
                clearable
                clearText="Clear"
                className="select"
                placeholder="Name of dispenser"
                onChange={(e) => {
                  setDispenser(e.selected);
                  setDispenserError(false);
                }}
                selected={dispenser}>
                {data.users.users.map((user) =>
                  <SingleSelectOption key={user.id} label={user.name} value={user.name} />
                )}
              </SingleSelect>
            </div>
            <p className="desc">Select the person dispensing.</p>
          </div>

          <div className="section">
            <h4 className="title">Recipient</h4>
            <div className="small-dropdown">
              <SingleSelect
                error={recipientError}
                filterable
                clearable
                clearText="Clear"
                className="select"
                placeholder="Name of recipient"
                onChange={(e) => {
                  setRecipient(e.selected);
                  setRecipientError(false);
                }}
                selected={recipient}>
                {data.personnel.personnel.map((user) =>
                  <SingleSelectOption key={user.name} label={user.name + " (" + user.affiliation + ")"} value={user.name} />
                )}
              </SingleSelect>
            </div>
            <p className="desc">Select the person receiving.</p>
          </div>
        </div>

        {/*Date selection.*/}
        <div className="controls">
        </div>

        <div className="recipient-controls">
          <Button large primary className="icon-button" type="button" onClick={(e) => {
            const allEntriesConfirmed = entries.every(entry => confirmedEntries[entry.id]);
            if (!dispenser) {
              setDispenserError(true);
            } else if (!recipient) {
              setRecipientError(true);
            } else if (!allEntriesConfirmed) {
              setShowAlert(true);
            } else {
              setModalHidden(false);
            }
          }}><IconCheckmarkCircle24 />Verify Selection</Button>
        </div>

        <Modal hide={modalHidden} medium>
          <ModalContent>
            <h4>Confirm: Dispensing Commodities from {dispenser} to {recipient}</h4>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Commodity</b></TableCell>
                  <TableCell><b>Quantity</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/*Mapping of commodities using the filteredData*/}
                {entries.map(commodity => (
                  <TableRow key={commodity.id}>
                    <TableCell>{getCommodityName(commodity.commodity, mergedData)}</TableCell>
                    <TableCell>{commodity.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalContent>
          <ModalActions>
            <ButtonStrip end>
              <Button className="cancel-button" medium destructive onClick={(e) => {
                setModalHidden(true);
              }}><IconUndo24/>Cancel</Button>
              <Button className="confirm-button"medium primary onClick={(e) => {
                mutate({
                  dispenseMutation: commodityTotalAmountArr,
                }).then(function (response) {
                  if (response.response.status !== "SUCCESS") {
                    console.log(response);
                  }
                })
                clearAll();
                setModalHidden(true);

                //logging the transaction
                let allTransactions = [];
                allTransactions = data.transactions.transactions;

                let d = new Date();
                let transaction = {
                    id: parseInt(allTransactions.length) + 1,
                    action: "Dispense",
                    time: d.toLocaleString(),
                    dispenser: dispenser,
                    recipient: recipient,
                    commodities: transactionArr
                }

                //allTransactions = [...allTransactions, ...updatedTransactions];
                allTransactions.push(transaction);

                mutateTransaction({
                    transactions: allTransactions,
                }).then(function (response) {
                    if (response.status !== "SUCCESS") {
                    console.log(response);
                    }
                })

                Toastify({
                  text: "Commodities successfully dispensed.",
                  duration: 3000,
                  destination: "https://github.com/apvarun/toastify-js",
                  newWindow: true,
                  close: true,
                  gravity: "top", // `top` or `bottom`
                  position: "center", // `left`, `center` or `right`
                  stopOnFocus: true, // Prevents dismissing of toast on hover
                  style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                  },
                  onClick: function () { } // Callback after click
                }).showToast();
              }}>
                <IconCheckmarkCircle24/>Confirm</Button>
            </ButtonStrip>
          </ModalActions>
        </Modal>
      </div>
    )
  }

  else {
    return (
      <div>
        <h1>Dispense</h1>
      </div>
    )
  }
}

function NewEntry({ id, index, mergedData, onRemove, onCommodityChange, onConfirm, setConfirmedForEntry }) {
  const [amount, setAmount] = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const handleSelectChange = (value) => {
    setSelectedCommodity(value.selected);
    onCommodityChange(id, value.selected, amount);
  };

  const handleAmountChange = (event) => {
    setAmount(event.value);
    onCommodityChange(id, selectedCommodity, event.value);
  };

  const handleConfirm = () => {
    if (!selectedCommodity || amount === 0 || amount === "") {
      setShowAlert(true);
      return;
    }

    setInputDisabled(true);
    setButtonVisible(false);
    setConfirmedForEntry(id, true);
    onConfirm();
  }

  return (
    <div>
      {showAlert && (
        <AlertBar
          duration={200}
          onHidden={() => setShowAlert(false)}
          warning>
          Please select a commodity and specify an amount.
        </AlertBar>
      )}
      <div className="controls">

        <div className="section">
          {index === 0 && <h4 className="title">Commodity</h4>}
          {index > 0 && <h4 className="title">‎</h4>}
          <div className="input-button-wrapper">
            <div className="small-dropdown">
              <SingleSelect filterable clearable clearText="Clear" disabled={inputDisabled} className="select" placeholder="Commodity" onChange={handleSelectChange} selected={selectedCommodity}>
                {mergedData.map((commodity) =>
                  <SingleSelectOption key={commodity.id} label={`${commodity.name} (${commodity.value})`} value={commodity.id} />
                )}
              </SingleSelect>
            </div>
          </div>
          <p className="desc">Select a commodity to dispense.</p>
        </div>

        <div className="section">
          {index === 0 && <h4 className="title">Quantity</h4>}
          {index > 0 && <h4 className="title">‎</h4>}
          <div className="input-button-wrapper">
            <div className="amount">
              <Input disabled={inputDisabled} className="numberInput" placeholder="# of packages" type="number" min="0" max="1000" onChange={handleAmountChange}></Input>
            </div>
          </div>
          <p className="desc">Write or add the amount of packages you would like to dispense.</p>
        </div>

        <div className="button-section">
          {buttonVisible && (<Button secondary className="controls-button" type="button" onClick={handleConfirm}><IconCheckmark24 />Confirm</Button>)}
          <Button basic className="controls-button cancel" type="button" onClick={onRemove}><IconCross24 />Cancel</Button>
        </div>

      </div>
    </div>
  );
}

function getCommodityName(id, mergedData) {
  let name = "";
  mergedData.map((element) => {
    if (element.id == id) {
      name = element.name;
    }
  })
  return name;
}
