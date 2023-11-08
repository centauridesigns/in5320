import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconFaceAdd24, IconCheckmark24, IconCheckmarkCircle24, IconEditItems24, IconDelete24 } from "@dhis2/ui-icons"
import { getPersonnel, getTransactions, postNewPersonnel } from "./api.js";

export function Dashboard() {
  const { loading, error, data } = useDataQuery(getTransactions());


  if (!data) {
    return <div><h1>Loading...</h1></div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Action</b></TableCell>
              <TableCell><b>Commodity</b></TableCell>
              <TableCell><b>New value</b></TableCell>
              <TableCell><b>Old value</b></TableCell>
              <TableCell><b>Time</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.transactions.transactions.map(transaction => (
              transaction.commodities.map(commodity => (
                <TableRow>
                  <TableCell>{transaction.action}</TableCell>
                  <TableCell>{commodity.name}</TableCell>
                  <TableCell>{commodity.newValue}</TableCell>
                  <TableCell>{commodity.oldValue}</TableCell>
                  <TableCell>{transaction.time}</TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
