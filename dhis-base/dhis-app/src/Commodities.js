import React, { useState, useEffect } from "react";
import { getData, getTransactions, postDispenseTransaction, postNewTransaction } from './api.js';
import { useDataMutation, useDataQuery} from '@dhis2/app-runtime';
import { Table, TableHead, TableBody, TableRow, TableCell, DropdownButton, FlyoutMenu, Button, Input, Modal, ModalContent, ModalActions, ButtonStrip, SingleSelect, SingleSelectOption} from "@dhis2/ui";
import { IconCross24, IconAdd24, IconCheckmark24, IconCheckmarkCircle24, IconEditItems24 } from "@dhis2/ui-icons"
import "./Commodities.css";
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

export function Commodities(props) {
  const { mergedData } = props;
  const [updater, setUpdater] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [commodityTotalAmountArr, setCommodityTotalAmountArr] = useState([]);
  const [commodityAdditionArr, setCommodityAdditionArr] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showUpdateLayout, setShowUpdateLayout] = useState(false);
  const [modalHidden, setModalHidden] = useState(true);
  const [updaterError, setUpdaterError] = useState(false);
  const [mutate, { mutateLoading, mutateError }] = useDataMutation(
    postDispenseTransaction()
  );
  const [transactionArr, setTransactionArr] = useState([]);
  const [mutateTransaction, { mutateLoadingTransaction, mutateErrorTransaction }] = useDataMutation(
    postNewTransaction()
  );
  const { loading, error, data } = useDataQuery(getData());

  const handleConfirmEntry = (id, value) => {
    console.log(id, value)
    if (!id || value === 0) { }
    else {
      let isFound = false;
      let oldValue = 0;
      mergedData.map((c) => {
        if (c.id == id) {
          oldValue = c.value
        }
      })

      commodityAdditionArr.forEach((c) => {
          if(c.dataElement == id){
            c.value = parseInt(value); // Update the value
            isFound = true; 
          }
      });

      if (!isFound){
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

      }else{
        commodityTotalAmountArr.forEach((c) => {
          if(c.dataElement == id){
            c.value = parseInt(oldValue) + parseInt(value); // Update the value
          }
        });
        transactionArr.forEach((c) => {
          if(c.id == id){
            c.newValue = parseInt(oldValue) + parseInt(value); // Update the value
          }
        });
      }
    }
  };

  function clearAll() {
    setCommodityTotalAmountArr([]);
    setCommodityAdditionArr([]);
    setShowUpdateLayout(false);
    setUpdater("");
    setUpdaterError(false);
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.value);
  };


  useEffect(() => {
    if (mergedData) {
      let result = mergedData.filter(commodity =>
        commodity.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      setFilteredData(result);
    }
  }, [searchTerm, mergedData]);

  if (!mergedData || !data) {
    return <div><h1>Loading...</h1></div>;
  }

  return (
    <div>
      <h1>Commodities</h1>
      <div className="controls">
        <Input className="searchbar"
          name="searchBar"
          type="text"
          placeholder="Search for commodities"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {showUpdateLayout ? (
          <Button destructive className="cancel-button" onClick={() => setShowUpdateLayout(!showUpdateLayout)}>
            Cancel
          </Button>
        ) : (
          <Button className="update-stock-button" onClick={() => setShowUpdateLayout(!showUpdateLayout)}>
            <IconEditItems24 /> Update Stock
          </Button>
        )}
      </div>
      <div className="table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Quantity</b></TableCell>
              {showUpdateLayout && <TableCell><b>Incoming Quantity</b></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map(commodity => (
              <TableRow key={commodity.id}>
                <TableCell>{commodity.name}</TableCell>
                <TableCell>{commodity.value}</TableCell>
                {showUpdateLayout && (
                  <TableCell>
                    <Input
                      onChange={(e) => handleConfirmEntry(commodity.id, e.value)}
                      placeholder="# of incoming commodities"
                      type="number" min="0" max="1000"
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showUpdateLayout && (
          <Button className="update-button" primary large onClick={(e) => {
            //handleUpdateAllQuantities()
            setModalHidden(false)
          }}>
            <IconCheckmarkCircle24 /> Update All Quantities
          </Button>
        )}
      </div>
      <Modal hide={modalHidden} medium>
        <ModalContent>
          <h4>Confirm: Incoming Commodities</h4>
          <Table>
            <TableHead>
              <TableRow>
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
        </ModalContent>
        <ModalActions>
          <ButtonStrip end>
            <Button medium destructive onClick={(e) => {
              setModalHidden(true);
            }}>Cancel</Button>
            <Button medium primary onClick={(e) => {
              if (!updater){
                setUpdaterError(true);
              }else{
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
              Confirm</Button>
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