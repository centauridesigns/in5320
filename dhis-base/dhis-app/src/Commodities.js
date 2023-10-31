import React, { useState, useEffect } from "react";
import { postDispenseTransaction } from './api.js';
import { useDataMutation } from '@dhis2/app-runtime';
import { Table, TableHead, TableBody, TableRow, TableCell, DropdownButton, FlyoutMenu, Button, Input, Modal, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import "./Commodities.css";
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

export function Commodities(props) {
  const { mergedData } = props;

  const [searchTerm, setSearchTerm] = useState("");
  const [commodityTotalAmountArr, setCommodityTotalAmountArr] = useState([]);
  const [commodityAdditionArr, setCommodityAdditionArr] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showUpdateLayout, setShowUpdateLayout] = useState(false);
  const [modalHidden, setModalHidden] = useState(true);
  const [mutate, { mutateLoading, mutateError }] = useDataMutation(
    postDispenseTransaction()
  );

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
      }else{
        commodityTotalAmountArr.forEach((c) => {
          if(c.dataElement == id){
            c.value = parseInt(oldValue) + parseInt(value); // Update the value
          }
        });
      }
    }
  };

  function clearAll() {
    setCommodityTotalAmountArr([]);
    setCommodityAdditionArr([]);
    setShowUpdateLayout(false);
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

  if (!mergedData) {
    return <div><h1>Loading...</h1></div>;
  }

  return (
    <div>
      <h1>Commodities</h1>
      <div className="controls">
        <Input className="searchbar"
          name="searchBar"
          type="text"
          placeholder="Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <DropdownButton className="dropdown"
          component={<FlyoutMenu></FlyoutMenu>}
          name="dropDown"
          value="dropDownValue"
        >
          Category
        </DropdownButton>
        <Button onClick={() => setShowUpdateLayout(!showUpdateLayout)}>
          {showUpdateLayout ? "Cancel" : "Incoming Quantity"}
        </Button>
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
                      placeholder="Incoming Quantity"
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
            Update All Quantities
          </Button>
        )}
      </div>
      <Modal hide={modalHidden} medium>
        <ModalContent>
          <h4>Incoming commodities</h4>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Commodity</b></TableCell>
                <TableCell><b>Quantity</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/*Mapping of commodities using the filteredData*/}
              {commodityAdditionArr.map(commodity => (
                <TableRow key={commodity.dataElement}>
                  <TableCell>{getCommodityName(commodity.dataElement, mergedData)}</TableCell>
                  <TableCell>{`${getValueFromId(commodity.dataElement, commodityTotalAmountArr)} (+${commodity.value})`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalContent>
        <ModalActions>
          <ButtonStrip end>
            <Button medium destructive onClick={(e) => {
              setModalHidden(true);
            }}>Cancel</Button>
            <Button medium primary onClick={(e) => {
              mutate({
                dispenseMutation: commodityTotalAmountArr,
              }).then(function (response) {
                if (response.response.status !== "SUCCESS") {
                  success = false
                  console.log(response);
                }
              })
              clearAll();
              setModalHidden(true);

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