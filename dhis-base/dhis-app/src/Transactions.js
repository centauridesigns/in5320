import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, Tag, Card, DropdownButton, FlyoutMenu, MultiSelect, MultiSelectOption, SingleSelect, SingleSelectOption, Input} from "@dhis2/ui";
import { IconUserGroup24, IconTextListUnordered24, IconExportItems24, IconArrowUp16, IconArrowDown16, IconFilter24, IconList24, IconSubtractCircle16, IconAddCircle16 } from "@dhis2/ui-icons"
import { getPersonnel, getTransactions, postNewPersonnel } from "./api.js";

function formatDate(dateString) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const suffixes = ["th", "st", "nd", "rd"];

  // If the format is european, we detect it here. This part is to ensure the text is formatted correctly AND that the date is sorted correctly.
  let normalizedDateString;
  if (dateString.includes('.')) { // European
    normalizedDateString = dateString.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$2/$1/$3');
  } else { // American
    normalizedDateString = dateString;
  }

  // Split the string, generate a date using JS.
  const datePart = normalizedDateString.split(',')[0];
  const date = new Date(datePart);
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  // Split the string, generate a time using JS.
  const timePart = dateString.split(',')[1].trim();
  let [hours, minutes, seconds] = timePart.split(':').map(num => parseInt(num, 10));
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');

  // Determine suffix (1st, 2nd, 3rd, 4th) for formatted date.
  const suffix = (day % 10 === 1 && day !== 11) ? suffixes[1] :
    (day % 10 === 2 && day !== 12) ? suffixes[2] :
      (day % 10 === 3 && day !== 13) ? suffixes[3] : suffixes[0];

  // Generate the formatted date.
  const formattedDate = `${day}${suffix} of ${months[monthIndex]} ${year} (${hours}:${minutes}:${seconds} ${ampm})`;
  return formattedDate;
}

export function Transactions() {
  const { loading, error, data } = useDataQuery(getTransactions());
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedOptions, setSelectedOptions] = useState(["dispense", "update"]);
  const [sortedTransactions, setSortedTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const sortByLatest = () => {
    setSortOrder("latest");
  };

  const sortByOldest = () => {
    setSortOrder("oldest");
  };

  const handleSelectedChange = (value) => {
    setSelectedOptions(value.selected);
  }

  useEffect(() => {
    console.log('Selected Options:', selectedOptions);
  
    if (data) {
      // Generate standardized date formats for all dates.
      const standardizedTransactions = data.transactions.transactions.map(transaction => {
        const standardizedDate = standardizeDateFormat(transaction.time);
        return {...transaction, standardizedDate};
      });
  
      // Sort the transactions based on the provided option (latest, oldest).
      standardizedTransactions.sort((a, b) => {
        const dateA = new Date(a.standardizedDate).getTime();
        const dateB = new Date(b.standardizedDate).getTime();
        return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
      });
  
      // Filter the transactions based on type by cross-checking it with the action, then verify that the search term matches (assuming it exists).
      let filteredTransactions = standardizedTransactions.filter(transaction =>
        selectedOptions.includes(transaction.action.toLowerCase()) &&
        transaction.commodities.some(commodity => 
          commodity.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      setSortedTransactions(filteredTransactions);
    }
  }, [selectedOptions, data, sortOrder, searchTerm]);

  function standardizeDateFormat(dateString) {
    if (dateString.includes('.')) {
      return dateString.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$2/$1/$3');
    } else {
      return dateString;
    }
  }

  return (
    <div>
      <div className="banner">
        <IconList24 />
        <h1>Transactions</h1>
      </div>

      {/* Search controls */}
      <div className="search-controls">
        <Input className="searchbar" placeholder="Search for commodities" value={searchTerm} onChange={(event) => setSearchTerm(event.value)}>
        </Input>
        <MultiSelect selected={selectedOptions} onChange={handleSelectedChange} className="multibar" prefix="Displaying">
          <MultiSelectOption className="sort-item" label="Dispense" value="dispense" />
          <MultiSelectOption className="sort-item" label="Replenishment" value="update" />
        </MultiSelect>
        <DropdownButton
          component={
            <FlyoutMenu>
              <MenuItem
                className={`sort-item ${sortOrder === 'latest' ? 'selected' : ''}`}
                label="Date (latest)"
                onClick={sortByLatest} />
              <MenuItem
                className={`sort-item ${sortOrder === 'oldest' ? 'selected' : ''}`}
                label="Date (oldest)"
                onClick={sortByOldest} />
            </FlyoutMenu>
          }
          className="sort-button">
          <IconFilter24 /> Sorting
        </DropdownButton>
      </div>

      {/* If nothing is selected, display call to action.*/}
      {selectedOptions.length === 0 &&
        <div>
          <p className="desc">Please select transaction type(s) to show. </p>
        </div>}

      {/* If something is selected, display the table.*/}
      {selectedOptions.length > 0 &&
        <div>
          {sortedTransactions.map(transaction => (
            <div className="table" key={transaction.id}>
              <Table>
                <TableHead>
                  <TableRow className="table-header">
                    <TableCell className="table-info">
                      {transaction.action == "Update" ? "Replenishment" : transaction.action}
                      {/*transaction.action == "Update" && <Tag className="pos-tag" positive>+</Tag>*/}
                      {/*transaction.action == "Dispense" && <Tag className="neg-tag" negative>-</Tag>*/}
                      {transaction.action === "Update" && <IconAddCircle16 />}
                      {transaction.action === "Dispense" && <IconSubtractCircle16 />}
                    </TableCell>
                    <TableCell className="tableCell"></TableCell>
                    <TableCell className="table-date">{`${formatDate(transaction.time)}`}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="tableCell"><b>{transaction.action === "Dispense" ? 'Dispensed Commodity' : 'Stocked Commodity'}</b></TableCell>
                    {transaction.action === "Dispense" && <TableCell className="tableCell"><b>Amount Dispensed</b></TableCell>}
                    {transaction.action === "Update" && <TableCell className="tableCell"><b>Amount Restocked</b></TableCell>}
                    <TableCell className="tableCell"><b>{transaction.action === "Dispense" ? 'Dispensed To' : 'Restocked By'}</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transaction.commodities.map(commodity => (
                    <TableRow key={commodity.id}>
                      <TableCell className="tableCell">{commodity.name}</TableCell>
                      <TableCell className="indicator">
                        {transaction.action === "Update" && <Tag className="pos-tag" positive>+{commodity.newValue - commodity.oldValue}</Tag>}
                        {transaction.action === "Dispense" && <Tag className="neg-tag" negative>{commodity.newValue - commodity.oldValue}</Tag>}
                      </TableCell>
                      {transaction.action === "Dispense" && <TableCell className="tableCell">{transaction.recipient}</TableCell>}
                      {transaction.action === "Update" && <TableCell className="tableCell">{transaction.updatedBy}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      }
    </div>
  );
}