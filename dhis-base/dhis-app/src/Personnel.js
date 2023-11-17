import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip, DropdownButton, FlyoutMenu, Checkbox } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconFaceAdd24, IconCheckmark24, IconEditItems24, IconDelete24, IconUndo24, IconFilter24, IconUserGroup24 } from "@dhis2/ui-icons"
import { getPersonnel, postNewPersonnel } from "./api.js";
import "./Personnel.css"
import Toastify from 'toastify-js'

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
  const [modalDeleteHidden, setModalDeleteHidden] = useState(true);
  const [confirmed, setConfirmed] = useState(true);
  const [showEditLayout, setShowEditLayout] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortMode, setSortMode] = useState("alphabetical");
  const [mutate, { mutateLoading, mutateError }] = useDataMutation(
    postNewPersonnel()
  );
  let i = 0;

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

  const sortAlphabetically = (data) => {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }

  const sortHospital = (data) => {
    return data.sort((a, b) => a.affiliation.localeCompare(b.affiliation));
  }

  const handleCheckboxChange = (name, isChecked) => {
    if (isChecked) {
      setSelectedItems(prev => [...prev, name]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== name));
    }
  };

  // Effect for searching. We map the table to filteredData instead of data.personnel.personnel below. Conditional rendering ensures the
  // site does not crash as the loading occurs.
  useEffect(() => {
    if (data?.personnel?.personnel) {
      let filtered = searchTerm.trim() ? data.personnel.personnel.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) : data.personnel.personnel;

      let sorted = [...filtered]

      if (sortMode === "alphabetical") {
        sorted = sortAlphabetically(sorted);
      } else if (sortMode === "alphabetical-reverse") {
        sorted = sortAlphabetically(sorted).reverse();
      } else if (sortMode === "hospital") {
        sorted = sortHospital(sorted);
      } else if (sortMode === "hospital-reverse") {
        sorted = sortHospital(sorted).reverse();
      }

      setFilteredData(sorted);
    }
  }, [searchTerm, data?.personnel?.personnel, sortMode]);

  // Called when removing personnel.
  const confirmPersonnelDelete = () => {
    if (selectedItems.length > 0) {
      const updatedPersonnel = data.personnel.personnel.filter(p => !selectedItems.includes(p.name));

      mutate({
        personnel: updatedPersonnel,
      }).then(response => {
        if (response.status !== "SUCCESS") {
          console.log(response);
        } else {
          selectedItems.forEach(item => {
            Toastify({
              text: selectedForDeletion.name + " was successfully deleted.",
              duration: 3000,
              destination: "https://github.com/apvarun/toastify-js",
              newWindow: true,
              close: true,
              gravity: "top",
              position: "center",
              stopOnFocus: true,
              style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              },
              onClick: function () { }
            }).showToast();
          });
        }
      }).catch(console.log);

      setSelectedItems([]);

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
      <div>
        <h1>Error</h1>
        <p>No data could be loaded from the API.</p>
      </div>
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
        <div className="banner">
          <IconUserGroup24 />
          <h1>Personnel</h1>
        </div>

        <div className="manage-controls">
          <div className="add">
            <Button className="icon-button" type="button" onClick={(e) => {
              setModalHidden(false)
            }}><IconFaceAdd24 /> Add Personnel</Button>
            <p className="desc">Add another personnel.</p>
          </div>

          <div className="manage">
            {showEditLayout ? (
              <Button secondary className="exit-button" onClick={() => setShowEditLayout(!showEditLayout)}>
                <IconCross24 />
                Exit Manage
              </Button>
            ) : (
              <Button className="icon-button" type="button" onClick={() => setShowEditLayout(!showEditLayout)}>
                <IconEditItems24 /> Manage Personnel
              </Button>
            )}
            {showEditLayout && <p className="desc">Exit the management mode.</p>}
            {!showEditLayout && <p className="desc">Manage existing personnel.</p>}
          </div>
        </div>

        <div className="search-controls">
          {/* Search Input */}
          <Input className="searchbar"
            name="searchBar"
            type="text"
            placeholder="Search for personnel"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <DropdownButton
            component={
              <FlyoutMenu>
                <MenuItem
                  className={`sort-item ${sortMode === 'alphabetical' ? 'selected' : ''}`}
                  label="Personnel (A-Z)"
                  onClick={() => setSortMode("alphabetical")} />
                <MenuItem
                  className={`sort-item ${sortMode === 'alphabetical-reverse' ? 'selected' : ''}`}
                  label="Personnel (Z-A)"
                  onClick={() => setSortMode("alphabetical-reverse")} />
                <MenuItem
                  className={`sort-item ${sortMode === 'hospital' ? 'selected' : ''}`}
                  label="Hospital (A-Z)"
                  onClick={() => setSortMode("hospital")} />
                <MenuItem
                  className={`sort-item ${sortMode === 'hospital-reverse' ? 'selected' : ''}`}
                  label="Hospital (Z-A)"
                  onClick={() => setSortMode("hospital-reverse")} />
              </FlyoutMenu>
            }
            className="sort-button">
            <IconFilter24 /> Sorting
          </DropdownButton>
        </div>

        <div className="table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Personnel</b></TableCell>
                <TableCell><b>Hospital</b></TableCell>
                {showEditLayout && <TableCell><b>Selected</b></TableCell>}
                {showEditLayout && <TableCell><b>‎</b></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((p) => (
                <TableRow>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.affiliation}</TableCell>
                  {showEditLayout && <TableCell className="remove-button-cell">
                    <Checkbox
                      label={""}
                      checked={selectedItems.includes(p.name)}
                      onChange={(e) => handleCheckboxChange(p.name, e.checked)}
                    ></Checkbox>
                  </TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {showEditLayout && <Button destructive className="update-quantities-button" large onClick={() => setModalDeleteHidden(false)} disabled={selectedItems.length === 0}>
          <IconDelete24 /> Remove Selected Personnel
        </Button>}
        <Modal hide={!showDeleteConfirmation} large>
          <ModalContent>
            <p>Are you sure you want to delete <b>{selectedForDeletion?.name}</b> from the register? This cannot be undone.</p>
            <ButtonStrip>
              <Button className="delete-button-2" destructive onClick={confirmPersonnelDelete}><IconDelete24 />Delete</Button>
              <Button className="cancel-button" onClick={() => setShowDeleteConfirmation(false)}><IconUndo24 /> Cancel</Button>
            </ButtonStrip>
          </ModalContent>
        </Modal>
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
                }}><IconCheckmark24 />Confirm</Button>
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

                  Toastify({
                    text: "Personnel successfully added.",
                    duration: 3000,
                    destination: "https://github.com/apvarun/toastify-js",
                    newWindow: true,
                    close: true,
                    gravity: "top",
                    position: "center",
                    stopOnFocus: true,
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    onClick: function () { } // Callback after click
                  }).showToast();

                  clearAll();
                  setModalHidden(true)
                }
              }}><IconFaceAdd24 /> Add Personnel</Button>
              <Button className="cancel-button" onClick={(e) => {
                setModalHidden(true);
                clearAll();
              }}><IconCross24 />Cancel</Button>
            </ButtonStrip>
          </ModalContent>
        </Modal>
        <Modal hide={modalDeleteHidden} medium>
          <ModalContent>
            <h4>Confirm Deletion</h4>
            <h4 className="subheader">You are deleting the following personnel:</h4>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Hospital</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/*Mapping of commodities using the filteredData*/}
                {selectedItems.map(item => {
                  const personnel = data.personnel.personnel.find(p => p.name === item);
                  return (
                    <TableRow key={personnel.name}>
                      <TableCell>{personnel.name}</TableCell>
                      <TableCell>{personnel.affiliation}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ModalContent>
          <ModalActions>
            <ButtonStrip end>
              <Button className="cancel-button" medium onClick={(e) => {
                setModalDeleteHidden(true);
              }}><IconCross24 /> Cancel</Button>
              <Button className="icon-button" medium destructive onClick={(e) => {
                confirmPersonnelDelete();
                Toastify({
                  text: "Personnel succesfully removed.",
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

                setModalDeleteHidden(true);
              }}>
                <IconDelete24 /> Remove</Button>
            </ButtonStrip>
          </ModalActions>
        </Modal>
      </div>
    );
  }
}

export default Personnel;