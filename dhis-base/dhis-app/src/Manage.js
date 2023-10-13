import React, {useState, useEffect} from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell } from "@dhis2/ui";

//the apirequest
const request = {
  request0: {
      resource: "/dataSets/ULowA8V3ucd"
  }
}

export function Manage() {
  const { loading, error, data } = useDataQuery(request)

  if (error) {
    return <span>ERROR: {error.message}</span>
  }

  if (loading) {
    return <span>Loading...</span>
  }

  if (data){
    console.log("repons: " + JSON.stringify(data))
    console.log("\ndatasets: " + JSON.stringify(data["dataSetElements"]))
  }

  return <h1>Manage</h1>;
}
