import React, { useState, useEffect } from "react";
import { postDispenseTransaction } from './api.js';
import { useDataMutation } from '@dhis2/app-runtime';
import { Table, TableHead, TableBody, TableRow, TableCell, DropdownButton, FlyoutMenu, Button, Input, Modal, ModalContent } from "@dhis2/ui";
import "./Commodities.css";

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
      setCommodityAdditionArr([...commodityTotalAmountArr, {
        categoryOptionCombo: "J2Qf1jtZuj8",
        dataElement: id,
        period: "202310",
        orgUnit: "XtuhRhmbrJM",
        value: parseInt(oldValue) + parseInt(value)  // Perform addition here
      }])

      let oldValue = 0;
      mergedData.map((c) => {
        if (c.id == id) {
          oldValue = c.value
        }
      })

      setCommodityTotalAmountArr([...commodityTotalAmountArr, {
        categoryOptionCombo: "J2Qf1jtZuj8",
        dataElement: id,
        period: "202310",
        orgUnit: "XtuhRhmbrJM",
        value: parseInt(oldValue) + parseInt(value)  // Perform addition here
      }])
    }
  };

  function clearAll() {
    setCommodityTotalAmountArr([]);
  }

  const handleUpdateAllQuantities = () => {
    mutate({
      dispenseMutation: commodityTotalAmountArr,
    })
      .then(response => {
        if (response.response.status !== "SUCCESS") {
          console.log(response);
        } else {
          // Add any success handling logic if needed
        }
        clearAll(); // Assuming this function is defined somewhere
        setModalHidden(true); // Assuming this function is defined somewhere
      })
      .catch(error => {
        console.error("Error updating quantities:", error);
      });
  };

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
          {showUpdateLayout ? "Cancel" : "Update Quantity"}
        </Button>
      </div>
      <div className="table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Quantity</b></TableCell>
              {showUpdateLayout && <TableCell><b>Update Quantity</b></TableCell>}
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
                      defaultValue={commodity.value}
                      onChange={(e) => handleConfirmEntry(commodity.id, e.value)}
                      placeholder="Update Quantity"
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showUpdateLayout && (
          <Button className="update-button" primary large onClick={(e) => {
            handleUpdateAllQuantities()
            setModalHidden(false)
          }}>
            Update All Quantities
          </Button>
        )}
      </div>
      <Modal hide={modalHidden} medium>
        <ModalContent>
          <h4>Confirm quantity</h4>
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
              Confirm</Button>
          </ButtonStrip>
        </ModalActions>
      </Modal>

    </div>
  );
}
