import React from "react";
import { Menu, MenuItem, IconDashboardWindow16 } from "@dhis2/ui";

export function Navigation(props) {
  return (
    <Menu>
      <MenuItem
        label="Dashboard"
        active={props.activePage == "Dashboard"}
        onClick={() => props.activePageHandler("Dashboard")}
      />
      <MenuItem
        label="Replenish"
        active={props.activePage == "Replenish"}
        onClick={() => props.activePageHandler("Replenish")}
      />
      <MenuItem
        label="Dispense"
        active={props.activePage == "Dispense"}
        onClick={() => props.activePageHandler("Dispense")}
      />
      <MenuItem
        label="Personnel"
        active={props.activePage == "Personnel"}
        onClick={() => props.activePageHandler("Personnel")}
      />
      <MenuItem
        label="Transactions"
        active={props.activePage == "Transactions"}
        onClick={() => props.activePageHandler("Transactions")}
      />
    </Menu>
  );
}
