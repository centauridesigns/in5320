import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconCheckmark24, IconCheckmarkCircle24 } from "@dhis2/ui-icons"
import { postNewPersonnel } from "./api.js";

import "./Personnel.css"

function NewEntry({ index, onRemove }) {
  const [personnel, setPersonnel] = useState("");
  const [hospital, setHospital] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);

  const handlePersonnelChange = (event) => {
    setPersonnel(event.value);
  };

  const handleHospitalChange = (event) => {
    setHospital(event.value);
  };

  const handleConfirm = () => {
    if (!personnel || !hospital) {
      setShowAlert(true);
      return;
    }

    setInputDisabled(true);
    setButtonVisible(false);
    
    // Placeholder for the API call to add the personnel and hospital
    console.log('Adding personnel:', personnel, 'for hospital:', hospital);
  }

  return (
    <div className="entry">
      {showAlert && (
        <AlertBar
          duration={200}
          onHidden={() => setShowAlert(false)}
          warning>
          Please specify both personnel and hospital.
        </AlertBar>
      )}
      <div className="controls">
        <div className="section">
          {index === 0 && <h4 className="title">Personnel</h4>}
          {index > 0 && <h4 className="title">‎</h4>}
          <Input disabled={inputDisabled} className="textInput" placeholder="Personnel name" type="text" onChange={handlePersonnelChange}></Input>
          <p className="desc">Enter the name of the personnel.</p>
        </div>

        <div className="section">
          {index === 0 && <h4 className="title">Hospital</h4>}
          {index > 0 && <h4 className="title">‎</h4>}
          <Input disabled={inputDisabled} className="textInput" placeholder="Hospital name" type="text" onChange={handleHospitalChange}></Input>
          <p className="desc">Enter the name of the hospital where the personnel works.</p>
        </div>

        <div className="button-section">
          {buttonVisible && <Button className="controls-button" type="button" onClick={handleConfirm}><IconCheckmark24 /></Button>}
          <Button destructive className="controls-button" type="button" onClick={onRemove}><IconCross24 /></Button>
        </div>

      </div>
    </div>
  );
}

export function Personnel() {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleAddPersonnel = () => {
    setEntries(prevEntries => [...prevEntries, {}]);
  }

  const handleRemovePersonnel = (index) => {
    setEntries(prevEntries => prevEntries.filter((_, i) => i !== index));
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.value);
  };

  return (
    <div>
      <h1>Personnel</h1>
      <div className="controls"> {/*Controls within the page*/}
        {/* Search Input */}
        <Input className="searchbar"
          name="searchBar"
          type="text"
          placeholder="Search for personnel"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Personnel</b></TableCell>
              <TableCell><b>Hospital</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

          </TableBody>
        </Table>
      </div>
      {entries.map((_, index) => (
        <NewEntry key={index} index={index} onRemove={() => handleRemovePersonnel(index)} />
      ))}
      <Button className="icon-button" type="button" onClick={handleAddPersonnel}><IconAdd24 /> Add Personnel</Button>
      <p className="desc">Add another individual.</p>
    </div>
  );
}

export default Personnel;