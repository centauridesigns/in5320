import React from "react";
import classes from "./App.module.css";
import { useState } from "react";

import { Dashboard } from "./Dashboard";
import { Manage } from "./Manage";
import { Navigation } from "./Navigation";
import { Datasets } from "./Datasets";

function MyApp() {
  const [activePage, setActivePage] = useState("Dashboard");

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
        {activePage === "Manage" && <Manage />}
        {activePage === "Datasets" && <Datasets />}
      </div>
    </div>
  );
}

export default MyApp;
