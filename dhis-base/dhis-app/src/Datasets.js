import React, {useState, useEffect} from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableCell } from "@dhis2/ui";

//the apirequest
const request = {
    request0: {
        resource: "/dataSets",
        params: {
            fields: "id,displayName,created",
            paging: "false"
        }
    }
}

export function Datasets() {
    //using the useDataQuery method imported
    const { loading, error, data } = useDataQuery(request)
    const [selectedDataset, setSelectedDataset] = useState(null);

    if (error) {
        return <span>ERROR: {error.message}</span>
    }

    if (loading) {
        return <span>Loading...</span>
    }

    const handleDatasetClick = (dataset) => {
        setSelectedDataset(dataset);
    };

      return (
        <div>
            <div style={{ display: "flex"}}>
                <div className="oneSide" style={{ flex: selectedDataset ? 1 : "auto"}}>
                    <h1>Datasets</h1>
                    <Menu>
                        {data.request0.dataSets.map((dataset) => (
                            <MenuItem key={dataset.id} label={dataset.displayName} onClick={() => handleDatasetClick(dataset)} />
                        ))}
                    </Menu>
                </div>
                {selectedDataset && (
                    <div class="oneSide" style={{ flex: 2}}>
                        <h1>Dataset Details</h1>
                        <Table>
                            <TableHead>
                                <TableRow>
                                <TableCell><b>Display Name</b></TableCell>
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>Creation Date</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableRow>
                                <TableCell>{selectedDataset.displayName}</TableCell>
                                <TableCell>{selectedDataset.id}</TableCell>
                                <TableCell>{selectedDataset.created}</TableCell>
                            </TableRow>
                        </Table>
                    </div>
                )}
            </div>
        </div>
      );
}