import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconFaceAdd24, IconCheckmark24, IconCheckmarkCircle24, IconEditItems24, IconDelete24 } from "@dhis2/ui-icons"
import { getPersonnel, postNewPersonnel } from "./api.js";
import "./Personnel.css"


export function Personnel() {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [personnel, setPersonnel] = useState("");
  const [hospital, setHospital] = useState("");
  const [inputAlert, setInputAlert] = useState(false);
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [personnelArr, setPersonnelArr] = useState([]);
  const [modalHidden, setModalHidden] = useState(true);
  const [confirmed, setConfirmed] = useState(true);
  const [showEditLayout, setShowEditLayout] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState(null);
  const [mutate, { mutateLoading, mutateError }] = useDataMutation(
    postNewPersonnel()
  );
  const { loading, error, data } = useDataQuery(getPersonnel());

  const handleSearchChange = (event) => {
    setSearchTerm(event.value);
  };

  const handlePersonnelChange = (event) => {
    setPersonnel(event.value);
  };

  const handleHospitalChange = (event) => {
    setHospital(event.value);
  };

  // Effect for searching. We map the table to filteredData instead of data.personnel.personnel below. Conditional rendering ensures the
  // site does not crash as the loading occurs.
  useEffect(() => {
    if (data?.personnel?.personnel) {
      const filtered = searchTerm.trim() ? data.personnel.personnel.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) : data.personnel.personnel;
      setFilteredData(filtered);
    }
  }, [searchTerm, data?.personnel?.personnel]);
  
  // Called when removing personnel.
  const confirmPersonnelDelete = () => {
    if (selectedForDeletion) {
      const updatedPersonnel = data.personnel.personnel.filter(p => p.name !== selectedForDeletion.name);

      mutate({
        personnel: updatedPersonnel,
      }).then(function (response) {
        if (response.status !== "SUCCESS") {
          console.log(response);
        }
      }).catch(function (response) {
        console.log(response);
      });

      clearAll();
    }
  }

  function clearAll() {
    setPersonnel("");
    setHospital("");
    setInputDisabled(false);
    setPersonnelArr([]);
    setConfirmed(true);
    setShowEditLayout(false);
    setSelectedForDeletion(null);
    setSelectedForDeletion(null);
    setShowDeleteConfirmation(false);
  }

  if (error) {
    return (
      <h1>Problem</h1>
    )
  }
  if (loading) {
    return (
      <h1>Loading..</h1>
    )
  }
  if (data) {
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
          {showEditLayout ? (
            <Button destructive className="cancel-button" onClick={() => setShowEditLayout(!showEditLayout)}>
              Cancel
            </Button>
          ) : (
            <Button className="update-stock-button" onClick={() => setShowEditLayout(!showEditLayout)}>
              <IconEditItems24 /> Edit Personnel
            </Button>
          )}
        </div>
        <div className="table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Personnel</b></TableCell>
                <TableCell><b>Hospital</b></TableCell>
                {showEditLayout && <TableCell><b>‎</b></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((p) => (
                <TableRow>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.affiliation}</TableCell>
                  {showEditLayout && <TableCell className ="remove-button-cell">
                    <Button className="controls-button" type="button" onClick={(e) => {
                      setSelectedForDeletion(p);
                      setShowDeleteConfirmation(true);
                    }}><IconDelete24 /></Button>
                  </TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Modal hide={!showDeleteConfirmation} large>
          <ModalContent>
            <p>Are you sure you want to delete {selectedForDeletion?.name}?</p>
            <ButtonStrip>
              <Button destructive onClick={confirmPersonnelDelete}>Confirm</Button>
              <Button onClick={() => setShowDeleteConfirmation(false)}> Cancel</Button>
            </ButtonStrip>
          </ModalContent>

        </Modal>
        <Button className="icon-button" type="button" onClick={(e) => {
          setModalHidden(false)
        }}><IconFaceAdd24 /> Add Personnel</Button>
        <p className="desc">Add another individual.</p>
        <Modal hide={modalHidden} large>
          <ModalContent>
            <h4>Add: Personnel</h4>
            {inputAlert && (
              <AlertBar
                duration={200}
                onHidden={() => setInputAlert(false)}
                warning>
                Please specify both personnel and hospital.
              </AlertBar>
            )}
            {confirmAlert && (
              <AlertBar
                duration={200}
                onHidden={() => setConfirmAlert(false)}
                warning>
                Please confirm the new personnel.
              </AlertBar>
            )}
            <div className="controls">
              <div className="section">
                <h4 className="title">Personnel</h4>
                <Input disabled={inputDisabled} className="textInput" placeholder="Personnel name" type="text" value={personnel} onChange={handlePersonnelChange}></Input>
                <p className="desc">Enter the name of the personnel.</p>
              </div>
              <div className="section">
                <h4 className="title">Hospital</h4>
                <Input disabled={inputDisabled} className="textInput" placeholder="Hospital name" type="text" value={hospital} onChange={handleHospitalChange}></Input>
                <p className="desc">Enter the name of the related hospital.</p>
              </div>
              <div className="button-section">
                <Button secondary className="controls-button" type="button" onClick={(e) => {
                  if (!personnel || hospital === 0) {
                    setInputAlert(true);
                    return;
                  }

                  setConfirmed(false);

                  setInputDisabled(true);

                  setPersonnelArr([{
                    name: personnel,
                    affiliation: hospital
                  }])
                }}><IconCheckmark24 /></Button>
              </div>
            </div>
            <ButtonStrip>
              <Button primary disabled={confirmed} className="icon-button" type="button" onClick={(e) => {
                if (!inputDisabled) {
                  setConfirmAlert(true);
                } else {
                  let allPersonnel = [];
                  allPersonnel = data.personnel.personnel;
                  allPersonnel.push(personnelArr[0]);

                  mutate({
                    personnel: allPersonnel,
                  }).then(function (response) {
                    if (response.status !== "SUCCESS") {
                      console.log(response);
                    }
                  }).catch(function (response) {
                    console.log(response);
                  });

                  clearAll();
                  setModalHidden(true)
                }
              }}><IconCheckmarkCircle24 /> Verify Addition</Button>
              <Button medium destructive onClick={(e) => {
                setModalHidden(true);
                clearAll();
              }}>Cancel</Button>
            </ButtonStrip>
          </ModalContent>
        </Modal>
      </div>
    );
  }
}

export default Personnel;