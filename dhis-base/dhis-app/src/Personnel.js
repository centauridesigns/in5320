import React, { useState, useEffect } from "react";
import { useDataQuery } from '@dhis2/app-runtime'
import { Menu, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, SingleSelect, SingleSelectOption, Input, Button, AlertBar, Modal, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import { IconCross24, IconAdd24, IconCheckmark24, IconCheckmarkCircle24 } from "@dhis2/ui-icons"
import { postNewPersonnel } from "./api.js";

export function Personnel(props) {
  return (
    <div>
      <h1>Personnel</h1>
      <div className="commodity-controls">

      </div>
    </div>
  );
}