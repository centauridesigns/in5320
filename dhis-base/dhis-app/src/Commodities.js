import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell } from "@dhis2/ui";

export function Commodities(props) {
  const { mergedData } = props;
  console.log("mergeddata in manage: ", mergedData)
  
  if (!mergedData){
    return <div><h1>Loading...</h1></div>;
  }
  return (
    <div> {/*Complete page*/}
      <h1>Commodities</h1>
      <div className="controls"> {/*Controls within the page*/}

      </div>
      <div className="table"> {/*Table within the page */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Quantity</b></TableCell>
            </TableRow>
            {/*Mapping of commodities using the mergedData*/}
            {mergedData.map(commodity => ( 
              <TableRow key={commodity.id}> 
                <TableCell>{commodity.name}</TableCell>
                <TableCell>{commodity.id}</TableCell>
                <TableCell>{commodity.value}</TableCell>
            </TableRow>
            ))}
          </TableHead>
        </Table>
      </div>
    </div>
  )
}
