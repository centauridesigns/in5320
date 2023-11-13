import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconFaceAdd24, IconCheckmark24, IconCheckmarkCircle24, IconEditItems24, IconDelete24 } from "@dhis2/ui-icons"
import { getPersonnel, getTransactions, postNewPersonnel } from "./api.js";
import "./Dashboard.css";

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
              <TableRow>
                <TableCell className="tableCell">{`${transaction.action} - ${transaction.time}`}</TableCell>
                <TableCell className="tableCell"></TableCell>
                <TableCell className="tableCell"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="tableCell"><b>{transaction.action === "Dispense" ? 'Dispensed Commodity' : 'Stocked Commodity'}</b></TableCell>
                <TableCell className="tableCell"><b>{transaction.action === "Dispense" ? 'Dispensed by' : 'Updated by'}</b></TableCell>
                <TableCell className="tableCell"><b>Value change</b></TableCell>
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
