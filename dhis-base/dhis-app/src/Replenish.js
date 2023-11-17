import React, { useState, useEffect } from "react";
import { getData, getTransactions, postDispenseTransaction, postNewTransaction } from './api.js';
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';
import { Table, TableHead, TableBody, TableRow, TableCell, DropdownButton, FlyoutMenu, MenuItem, Button, Input, Modal, ModalContent, ModalActions, ButtonStrip, SingleSelect, SingleSelectOption, IconCross24, AlertBar, IconFilter24 } from "@dhis2/ui";
import { IconCheckmarkCircle24, IconEditItems24, IconImportItems24 } from "@dhis2/ui-icons"
import "./Replenish.css";
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

export function Replenish(props) {
  const { mergedData } = props;
  const [updater, setUpdater] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [commodityTotalAmountArr, setCommodityTotalAmountArr] = useState([]);
  const [commodityAdditionArr, setCommodityAdditionArr] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [modalHidden, setModalHidden] = useState(true);
  const [updaterError, setUpdaterError] = useState(false);
  const [showIntAlert, setShowIntAlert] = useState(false);
  const [editDisabled, setEditDisabled] = useState(true);
  const [sortMode, setSortMode] = useState("alphabetical");
  const [mutate, { mutateLoading, mutateError }] = useDataMutation(
    postDispenseTransaction()
  );
  const [transactionArr, setTransactionArr] = useState([]);
  const [mutateTransaction, { mutateLoadingTransaction, mutateErrorTransaction }] = useDataMutation(
    postNewTransaction()
  );
  const { loading, error, data } = useDataQuery(getData());

  const handleConfirmEntry = (id, value) => {
    console.log(id, value);
    setEditDisabled(false);

    const re = /^[0-9\b]+$/;

    if (!id || (!re.test(value) && value !== '')) {
      setShowIntAlert(true);
      setEditDisabled(true);
      return;
    }

    if (!id || value === 0 || !value) {
      if (!value) {
        //empty input, arrays need to clear past objects now containing empty values
        var l = commodityTotalAmountArr.length;

        commodityTotalAmountArr.forEach((c) => {
          if (c.dataElement == id) {
            setCommodityTotalAmountArr(prevEntries => prevEntries.filter(c => c.dataElement !== id));
          }
        });
        commodityAdditionArr.forEach((c) => {
          if (c.dataElement == id) {
            setCommodityAdditionArr(prevEntries => prevEntries.filter(c => c.dataElement !== id));
          }
        });
        transactionArr.forEach((c) => {
          if (c.id == id) {
            setTransactionArr(prevEntries => prevEntries.filter(c => c.id !== id));
          }
        });

        if (l == 1) {
          //the only element in arr is possibly NaN, disable confirm
          if (id == commodityAdditionArr[0].dataElement) {
            setEditDisabled(true);
          } else {
            setEditDisabled(false);
          }
        }
      }
    }
    else {
      let isFound = false;
      let oldValue = 0;
      mergedData.map((c) => {
        if (c.id == id) {
          oldValue = c.value
        }
      })

      commodityAdditionArr.forEach((c) => {
        if (c.dataElement == id) {
          c.value = parseInt(value); // Update the value
          isFound = true;
        }
      });

      if (!isFound) {
        setCommodityAdditionArr([...commodityAdditionArr, {
          categoryOptionCombo: "J2Qf1jtZuj8",
          dataElement: id,
          period: "202310",
          orgUnit: "XtuhRhmbrJM",
          value: parseInt(value)
        }])

        setCommodityTotalAmountArr([...commodityTotalAmountArr, {
          categoryOptionCombo: "J2Qf1jtZuj8",
          dataElement: id,
          period: "202310",
          orgUnit: "XtuhRhmbrJM",
          value: parseInt(oldValue) + parseInt(value)
        }])

        setTransactionArr([...transactionArr, {
          id: id,
          name: getCommodityName(id, mergedData),
          newValue: parseInt(oldValue) + parseInt(value),
          oldValue: parseInt(oldValue),
        }])

      } else {
        commodityTotalAmountArr.forEach((c) => {
          if (c.dataElement == id) {
            c.value = parseInt(oldValue) + parseInt(value); // Update the value
          }
        });
        transactionArr.forEach((c) => {
          if (c.id == id) {
            c.newValue = parseInt(oldValue) + parseInt(value); // Update the value
          }
        });
      }
    }
  };

  function clearAll() {
    setCommodityTotalAmountArr([]);
    setCommodityAdditionArr([]);
    setUpdater("");
    setUpdaterError(false);
    setEditDisabled(true);
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.value);
  };

  const sortAlphabetically = (data) => {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }

  const sortByQuantity = (data) => {
    return data.sort((a, b) => parseInt(b.value) - parseInt(a.value));
  }

  useEffect(() => {
    if (mergedData) {
      let result = mergedData.filter(commodity =>
        commodity.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );

      if (sortMode === 'alphabetical') {
        result = sortAlphabetically(result);
      } else if (sortMode === 'quantity') {
        result = sortByQuantity(result);
      } else if (sortMode === 'alphabetical-reverse') {
        result = sortAlphabetically(result).reverse();
      } else if (sortMode === 'quantity-reverse') {
        result = sortByQuantity(result).reverse();
      }

      setFilteredData(result);
    }
  }, [searchTerm, mergedData, sortMode]);


  if (!mergedData || !data) {
    return <div><h1>Loading...</h1></div>;
  }

  let i = 0;

  return (
    <div>
      <div className="banner">
        <IconImportItems24/>
        <h1>Replenish</h1>
      </div>

      {showIntAlert && (
        <AlertBar
          duration={200}
          onHidden={() => setShowIntAlert(false)}
          warning>
          All inputs need to be positive integers.
        </AlertBar>
      )}
      <div className="search-controls">
        <Input className="searchbar"
          name="searchBar"
          type="text"
          placeholder="Search for commodities"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <DropdownButton
          component={
            <FlyoutMenu>
              <MenuItem
                className={`sort-item ${sortMode === 'alphabetical' ? 'selected' : ''}`}
                label="Name (A-Z)"
                onClick={() => setSortMode("alphabetical")} />
              <MenuItem
                className={`sort-item ${sortMode === 'alphabetical-reverse' ? 'selected' : ''}`}
                label="Name (Z-A)"
                onClick={() => setSortMode("alphabetical-reverse")} />
              <MenuItem
                className={`sort-item ${sortMode === 'quantity' ? 'selected' : ''}`}
                label="Quantity (highest)"
                onClick={() => setSortMode("quantity")} />
              <MenuItem
                className={`sort-item ${sortMode === 'quantity-reverse' ? 'selected' : ''}`}
                label="Quantity (lowest)"
                onClick={() => setSortMode("quantity-reverse")} />
            </FlyoutMenu>
          }
          className="sort-button">
          <IconFilter24 /> Sorting
        </DropdownButton>
      </div>
      <div className="table">
        <Table>
          <TableHead>
            <TableRow key={i++}>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Quantity</b></TableCell>
              <TableCell><b>Incoming Quantity</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map(commodity => (
              <TableRow key={commodity.id}>
                <TableCell>{commodity.name}</TableCell>
                <TableCell>{commodity.value}</TableCell>

                <TableCell>
                  <Input
                    onChange={(e) => handleConfirmEntry(commodity.id, e.value)}
                    placeholder="# of incoming commodities"
                    type="number" min="0"
                  />
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button primary disabled={editDisabled} className="update-quantities-button" large onClick={(e) => { setModalHidden(false); }}>
        <IconCheckmarkCircle24 /> Update All Quantities
      </Button>
      <Modal hide={modalHidden} medium>
        <ModalContent>
          <h4>Confirm Replenishment</h4>
          <h4 className="subheader">You are replenishing the stock for the following commodities:</h4>
          <Table>
            <TableHead>
              <TableRow key={i++}>
                <TableCell><b>Commodity</b></TableCell>
                <TableCell><b>New Quantity</b></TableCell>
                <TableCell><b>Old Quantity</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/*Mapping of commodities using the filteredData*/}
              {commodityAdditionArr.map(commodity => (
                <TableRow key={commodity.dataElement}>
                  <TableCell>{getCommodityName(commodity.dataElement, mergedData)}</TableCell>
                  <TableCell>{`${getValueFromId(commodity.dataElement, commodityTotalAmountArr)} (+${commodity.value})`}</TableCell>
                  <TableCell className="old-item">{`${getValueFromId(commodity.dataElement, commodityTotalAmountArr) - commodity.value}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <SingleSelect
            error={updaterError}
            filterable
            clearable
            clearText="Clear"
            className="updaterSelect"
            placeholder="Name of updater"
            onChange={(e) => {
              setUpdater(e.selected);
            }}
            selected={updater}>
            {data.users.users.map((user) =>
              <SingleSelectOption key={user.id} label={user.name} value={user.name} />
            )}
          </SingleSelect>
          <p className="desc">Select the user documenting the replenishment.</p>
        </ModalContent>
        <ModalActions>
          <ButtonStrip end>
            <Button className="cancel-button" medium onClick={(e) => {
              setModalHidden(true);
            }}><IconCross24 /> Cancel</Button>
            <Button className="verify-small-button" medium primary onClick={(e) => {
              if (!updater) {
                setUpdaterError(true);
              } else {
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
                  action: "Update",
                  time: d.toLocaleString(),
                  updatedBy: updater,
                  commodities: transactionArr
                }

                //allTransactions = [...allTransactions, ...transaction];
                allTransactions.push(transaction);

                mutateTransaction({
                  transactions: allTransactions,
                }).then(function (response) {
                  if (response.status !== "SUCCESS") {
                    console.log(response);
                  }
                })

                Toastify({
                  text: "Commodities successfully updated.",
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
              }
            }}>
              <IconImportItems24 /> Restock</Button>
          </ButtonStrip>
        </ModalActions>
      </Modal>

    </div>
  );
}

function getCommodityName(id, mergedData) {
  console.log("name in func: ", id);
  let name = "";
  mergedData.map((element) => {
    if (element.id == id) {
      name = element.name;
    }
  })
  return name;
}

function getValueFromId(id, data) {
  let value = 0;
  data.map((element) => {
    if (element.dataElement == id) {
      value = element.value;
    }
  })
  return value;
}