import React, { useState, useEffect } from "react";
import classes from "./App.module.css";

import { Dashboard } from "./Dashboard";
import { Navigation } from "./Navigation";
import { Datasets } from "./Datasets";
import { Commodities } from "./Commodities";
import { Dispense } from "./Dispense";
import { Personnel } from "./Personnel";

import { useDataQuery } from '@dhis2/app-runtime'

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
      orgUnit: 'XtuhRhmbrJM', // The orgunit id assigned to our group
      // for testing - orgUnit: 'ImspTQPwCqd', // Organizational unit belonging to John Abel
      period: '202310',
      dataSet: 'ULowA8V3ucd',
      fields: [
        'dataElement', // Data element so we can match items from dataSets with items from dataValueSets
        'dataValues[value]', // Extract value (number of items)
      ]
    },
  },
  sections: {
    resource: "/sections/"
  },
  localUsers: {
    resource: "/users",
    params: {
      paging: "false",
      userOrgUnits: true
    }
  },
  allUsers: {
    resource: "/users",
    params: {
      paging: "false",
    }
  },
};

function MyApp() {
  const [activePage, setActivePage] = useState("Dashboard");
  const { loading, error, data } = useDataQuery(query)
  const [mergedData, setMergedData] = useState(null);

  useEffect(() => {
    if (data) {
      const commodities = data.dataSets.dataSetElements.map(dataElement => ({
        id: dataElement.dataElement.id,
        name: dataElement.dataElement.name,
      }));

      const details = data.dataValueSets.dataValues.map(dataElement => ({
        dataElement: dataElement.dataElement,
        value: dataElement.value,
      }));

      console.log("local users: ", data.localUsers);
      console.log("all users: ", data.allUsers);

      const merge = commodities.map(commodity => {
        const matchingDataValue = details.find(detailsItem => detailsItem.dataElement === commodity.id);

        if (matchingDataValue) {
          return {
            ...commodity,
            name: commodity.name.replace("Commodities - ", ""),
            value: matchingDataValue.value,
          };
        } else {
          return {
            ...commodity,
            value: 0,
          };
        }
      });

      //sorting merge
      merge.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      setMergedData(merge);
    }
  }, [data]); //run this effect when data changes

  function activePageHandler(page) {
    setActivePage(page);
  }

  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <Navigation
          activePage={activePage}
          activePageHandler={activePageHandler}
        />
      </div>
      <div className={classes.right}>
        {activePage === "Dashboard" && <Dashboard />}
        {activePage === "Commodities" && <Commodities mergedData={mergedData} />}
        {activePage === "Dispense" && <Dispense mergedData={mergedData} />}
        {activePage === "Personnel" && <Personnel />}
      </div>
    </div>
  );
}

export default MyApp;
