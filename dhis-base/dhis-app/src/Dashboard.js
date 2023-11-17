import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, Tag, Card, DropdownButton, FlyoutMenu , Input} from "@dhis2/ui";
import { IconUserGroup24, IconTextListUnordered24, IconExportItems24, IconImportItems24, IconList24, IconFilter24, IconHome24, IconDashboardWindow24 } from "@dhis2/ui-icons"
import { getData, getPersonnel, getTransactions, postNewPersonnel } from "./api.js";
import "./Dashboard.css";

export function Dashboard(props) {
  const { loading, error, data } = useDataQuery(getData());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("alphabetical");
  const [mergedData, setMergedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [flag, setFlag] = useState(false);

  const sortAlphabetically = (data) => {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }

  const sortByQuantity = (data) => {
    return data.sort((a, b) => parseInt(b.value) - parseInt(a.value));
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.value);
  };

  useEffect(() => {
    if(!flag){
      if(data){
        setMergedData(mergeData(data));
        setFlag(true);
      }
    }
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
  }, [searchTerm, data, mergedData, sortMode]); 

  if (!data || !mergedData) {
    return <div><h1>Loading...</h1></div>;
  }


  return (
    <div>
      <div className="banner">
        <IconDashboardWindow24/>
        <h1>Dashboard</h1>
      </div>
      <div className="card-container">
        {/*Commodities button*/}
        <div className="card-button" onClick={(e) => {
          props.activePage === "Replenish"
          props.activePageHandler("Replenish")
        }}>
          <Card className="nav-card">
            <IconImportItems24 />
            <h3>Replenish</h3>
            <p>View, search, and replenish commodities.</p>
          </Card>
        </div>

        {/*Dispense button*/}
        <div className="card-button" onClick={(e) => {
          props.activePage === "Dispense"
          props.activePageHandler("Dispense")
        }}>
          <Card className="nav-card">
            <IconExportItems24 />
            <h3>Dispense</h3>
            <p>Dispense commodities, individually or in bulk.</p>
          </Card>
        </div>
      </div>

      <div className="card-container">
        {/*Personnel button*/}
        <div className="card-button" onClick={(e) => {
          props.activePage === "Personnel"
          props.activePageHandler("Personnel")
        }}>
          <Card className="nav-card" onClick={() => props.activePageHandler("Personnel")}>
            <IconUserGroup24 />
            <h3>Personnel</h3>
            <p>View, manage, and add recipient personnel.</p>
          </Card>
        </div>

        {/*transaction history button*/}
        <div className="card-button" onClick={(e) => {
          props.activePage === "Transactions"
          props.activePageHandler("Transactions")
        }}>
          <Card className="nav-card" onClick={() => props.activePageHandler("Transactions")}>
            <IconList24 />
            <h3>Transactions</h3>
            <p>View previous transactions for dispensed and replenished commodities.</p>
          </Card>
        </div>
      </div>
        

      <h3 className="transaction-h3">Inventory</h3>
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
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Quantity</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map(commodity => (
              <TableRow key={commodity.id}>
                <TableCell>{commodity.name}</TableCell>
                <TableCell>{commodity.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


function mergeData(data){
  if (data) {
    const commodities = data.dataSets.dataSetElements.map(dataElement => ({
      id: dataElement.dataElement.id,
      name: dataElement.dataElement.name,
    }));

    const details = data.dataValueSets.dataValues.map(dataElement => ({
      dataElement: dataElement.dataElement,
      value: dataElement.value,
    }));

    console.log("local users: ", data.localUsers);
    console.log("all users: ", data.allUsers);

    const merge = commodities.map(commodity => {
      const matchingDataValue = details.find(detailsItem => detailsItem.dataElement === commodity.id);

      if (matchingDataValue) {
        return {
          ...commodity,
          name: commodity.name.replace("Commodities - ", ""),
          value: matchingDataValue.value,
        };
      } else {
        return {
          ...commodity,
          value: 0,
        };
      }
    });

    //sorting merge
    merge.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    return merge;
  }
}
