import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconFaceAdd24, IconCheckmark24, IconCheckmarkCircle24, IconEditItems24, IconDelete24 } from "@dhis2/ui-icons"
import { getPersonnel, getTransactions, postNewPersonnel } from "./api.js";
import "./Dashboard.css";

function formatDate(dateString) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const suffixes = ["th", "st", "nd", "rd"];

  const date = new Date(dateString);
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

export function Dashboard() {
  const { loading, error, data } = useDataQuery(getTransactions());


  if (!data) {
    return <div><h1>Loading...</h1></div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {data.transactions.transactions.map(transaction => (
        <div className="table" key={transaction.id}>
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell className="tableCell">{`${transaction.action}: ${formatDate(transaction.time)}`}</TableCell>
                <TableCell className="tableCell"></TableCell>
                <TableCell className="tableCell"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="tableCell"><b>{transaction.action === "Dispense" ? 'Dispensed Commodity' : 'Stocked Commodity'}</b></TableCell>
                <TableCell className="tableCell"><b>{transaction.action === "Dispense" ? 'Dispensed By' : 'Updated By'}</b></TableCell>
                <TableCell className="tableCell"><b>Value Change</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {transaction.commodities.map(commodity => (
                  <TableRow key={commodity.id}>
                    <TableCell className="tableCell">{commodity.name}</TableCell>
                    <TableCell className="tableCell">{commodity.newValue}</TableCell>
                    <TableCell className="tableCell">{transaction.action === "Update" ? "+" :""}{commodity.newValue - commodity.oldValue}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
