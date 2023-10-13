import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell } from "@dhis2/ui";

//API request
const query = {
  dataSets: { // Enter the datasets
    resource: "/dataSets/ULowA8V3ucd?fields=dataSetElements[dataElement[name, id, *]]",  // URL resource, grabs name and ID of commodity
    params: { // Related parameters to send (none)
      fields: [ // Specific fields to return
        'name',
        'id',
      ],
    },
  },
  // Potential dataValueSets call, alternatively make other requests here
  dataValueSets: {
    resource: "/dataValueSets/",
    params: { // Related parameters to sen
      orgUnit: 'KiheEgvUZ0i',
      period: '202310',
      dataSet: 'ULowA8V3ucd',
      fields: [
        'dataElement', // Data element so we can match items from dataSets with items from dataValueSets
        'dataValues[value]', // Extract value (number of items), unknown if this is the actual number?
      ]
    },
  }
}

export function Manage() {
  const { loading, error, data } = useDataQuery(query)

  if (error) {
    return <span>ERROR: {error.message}</span>
  }

  if (loading) {
    return <span>Loading...</span>
  }

  if (data) {
    //console.log("RESPONSE: " + JSON.stringify(data))
    //console.log("\ndatasets: " + JSON.stringify(data["dataSetElements"]))

    const commodities = data.dataSets.dataSetElements.map(dataElement => ({
      id: dataElement.dataElement.id,
      name: dataElement.dataElement.name
    }));

    // TODO: Find, extract, match, and map values before displaying them.

    console.log(commodities)
  }

  return <h1>Manage</h1>;
}
