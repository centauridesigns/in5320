import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell } from "@dhis2/ui";


export function Dispense(props) {
    const { mergedData } = props;
    console.log("Merged Data in Dispense:", mergedData);
    return <h1>Dispense</h1>;
}