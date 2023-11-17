import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, Tag, Card, DropdownButton, FlyoutMenu, MultiSelect, MultiSelectOption } from "@dhis2/ui";
import { IconUserGroup24, IconTextListUnordered24, IconExportItems24, IconArrowUp16, IconArrowDown16, IconFilter24, IconList24, IconSubtractCircle16, IconAddCircle16 } from "@dhis2/ui-icons"
import { getPersonnel, getTransactions, postNewPersonnel } from "./api.js";

function formatDate(dateString) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const suffixes = ["th", "st", "nd", "rd"];

  const normalizedDateString = dateString.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$2/$1/$3'); // Ensures MAC dates are correctly converted.

  const date = new Date(normalizedDateString);
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const suffix = (day % 10 === 1 && day !== 11) ? suffixes[1] :
    (day % 10 === 2 && day !== 12) ? suffixes[2] :
      (day % 10 === 3 && day !== 13) ? suffixes[3] : suffixes[0];

  const formattedDate = `${day}${suffix} of ${months[monthIndex]} ${year} (${hours % 12 || 12}:${minutes}:${seconds} ${ampm})`;
  return formattedDate;
}

export function Transactions() {
  const { loading, error, data } = useDataQuery(getTransactions());
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedOption, setSelectedOption] = useState("both");

  if (!data) {
    return <div><h1>Loading...</h1></div>;
  }

  const sortByLatest = () => {
    setSortOrder("latest");
  };

  const sortByOldest = () => {
    setSortOrder("oldest");
  };

  const sortedTransactions = [...data.transactions.transactions].sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.time) - new Date(a.time);
    }

    else {
      return new Date(a.time) - new Date(b.time);
    }
  });

  return (
    <div>
      <div className="banner">
        <IconList24/>
        <h1>Transactions</h1>
      </div>
      <div className="transaction-controls">
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
                <TableCell className="tableCell"><b>{transaction.action === "Dispense" ? 'Dispensed To' : 'Updated By'}</b></TableCell>
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
  );
}