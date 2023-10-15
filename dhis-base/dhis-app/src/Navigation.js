import React from "react";
import { Menu, MenuItem } from "@dhis2/ui";

export function Navigation(props) {
  return (
    <Menu>
      <MenuItem
        label="Dashboard"
        active={props.activePage == "Dashboard"}
        onClick={() => props.activePageHandler("Dashboard")}
      />
      <MenuItem
        label="Manage"
        active={props.activePage == "Manage"}
        onClick={() => props.activePageHandler("Manage")}
      />
      <MenuItem
        label="Dispense"
        active={props.activePage == "Dispense"}
        onClick={() => props.activePageHandler("Dispense")}
      />
      <MenuItem
        label="Datasets (temp)"
        active={props.activePage == "Datasets"}
        onClick={() => props.activePageHandler("Datasets")}
      />
    </Menu>
  );
}
