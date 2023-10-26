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
        label="Commodities"
        active={props.activePage == "Commodities"}
        onClick={() => props.activePageHandler("Commodities")}
      />
      <MenuItem
        label="Dispense"
        active={props.activePage == "Dispense"}
        onClick={() => props.activePageHandler("Dispense")}
      />
    </Menu>
  );
}
