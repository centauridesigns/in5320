import React, { useState, useEffect } from "react";
import { Table, TableHead, TableRow, TableCell } from "@dhis2/ui";

export function Commodities(props) {
  const { mergedData } = props;
  console.log("mergeddata in manage: ", mergedData);

  // Define search variable and state for filtered data
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Create Handler for search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // This effect will run whenever there's a change in the search input.
  useEffect(() => {
    if (mergedData) {
      // Logic for filtering based on search term
      let result = mergedData.filter(commodity =>
        commodity.name.toLowerCase().startsWith(searchTerm.toLowerCase())  // changed to 'startsWith'
      );

      // Update the filtered data state
      setFilteredData(result);
    }
  }, [searchTerm, mergedData]);  // Dependency array

  if (!mergedData){
    return <div><h1>Loading...</h1></div>;
  }

  return (
    <div> {/*Complete page*/}
      <h1>Commodities</h1>
      <div className="controls"> {/*Controls within the page*/}
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="table"> {/*Table within the page */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Quantity</b></TableCell>
            </TableRow>
          </TableHead>
          {/*Mapping of commodities using the filteredData*/}
          {filteredData.map(commodity => ( 
            <TableRow key={commodity.id}> 
              <TableCell>{commodity.name}</TableCell>
              <TableCell>{commodity.id}</TableCell>
              <TableCell>{commodity.value}</TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </div>
  );
}
