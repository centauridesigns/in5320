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
        'dataValues[value]', // Extract value (number of items)
      ]
    },
  }
};

export function Manage() {
  const { loading, error, data } = useDataQuery(query)
  var [mergedData, setMergedData] = useState(null); // Define the mergedData publicly, allowing us to access it later at any time

  if (error) {
    return <span>ERROR: {error.message}</span>
  }

  if (loading) {
    return <span>Loading...</span>
  }

  if (data) {
    const commodities = data.dataSets.dataSetElements.map(dataElement => ({ // Data on commodities for table
      id: dataElement.dataElement.id,
      name: dataElement.dataElement.name
    }));

    const details = data.dataValueSets.dataValues.map(dataElement => ({ // Data on details for table, including the dataElement (ID) for merging
      dataElement: dataElement.dataElement,
      value: dataElement.value
    }));

    mergedData = commodities.map(commodity => { // Merging and mapping data so as to ensure one unified API response for later development
      const matchingDataValue = details.find(detailsItem => detailsItem.dataElement === commodity.id);
  
      if (matchingDataValue) {
        return {
          ...commodity,
          name: commodity.name.replace("Commodities - ", ""),
          value: matchingDataValue.value
        };
      } else {
        return {
          ...commodity,
          value: 0 // Set a default value if there's no matching dataValue
        };
      }
    });
  
    console.log(mergedData);
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
