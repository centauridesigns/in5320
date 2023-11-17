# DHIS2 Group Project for IN5320 Development in Platforms and Ecosystems
This project was made over a six week period for the IN5320 Development in Platforms and Ecosystems course at the Institute of Informatics at UiO.
The students involved in this project are Eivind E., Henrik H., Mads M., and Souhail Z. This team consists of two designers and two programmers.

### Outlining Functionality
The application contains five pages. Three of these are dedicated to a specific task, whilst the remaining two act as overviews. The Dashboard is one of these, allowing you to access all pages and view the available commodities. All pages where it seems natural allow for searching and sorting.
- Replenishing Commodities

    The Replenish page is dedicated to the restocking/replenishment of commodities when a new order is received. It also acts as a secondary overview.
    
- Dispensing Commodities

    The Dispense page provides users with the ability to dispense a given quantity of all commodities at bulk (RQ9), selecting which user dispensed the commodities, which hospital personnel to dispense to (RQ4), and the given date (manual or automatic) of dispensing.

- Managing Personnel

    The Personnel page provides users with the ability to administer/manage the personnel which can be dispensed to. These personnel are persistent (RQ4). This page features an overview of personnel, allowing for the addition of new personnel, as well as the deletion of existing ones.
    
- Viewing Transactions

    Each replenishment and dispense order is saved as a transaction. These can be viewed on the Transaction page.
    
### Implementation
This implementation relies religiously on DHIS2 components and icons through ReactJS to ensure a consistent design language. No custom pre-defined components were used in a technical sense - instead, each component undergoes a specific set of custom styling that is used consistently from occurence to occurence. We've otherwise defined our own buttons and table styling in accordance with the DHIS2 design language. There is considerable overlap in the CSS from file to file, but this affects no part of the functionality.

API calls occur in the API.js file, which includes all GET and POST requests. Data for commodities is first handled in the App.js file by merging information from
multiple datasets, before being sent to the Dispense and Replenish pages as props. The Dashboard also utilizes active page handlers to allow for navigation using
buttons/cards. Each page utilizes either (or both) DHIS2's useDataQuery for receiving information and useMutationQuery for sending information. Various handlers are
responsible for updating information on pages based on search, sorting, and displaying information. Queries and mutations occasionally occur within the render loop.

Custom data is sent to a separate data store (datastore) where needed (personnel, users, transactions) for persistence with the help of the aforementioned
useMutationQuery.

### Considerations
Although the application works as intended, there are a few things to remark on.

In a perfect solution, all pages with an overview should refresh their contents after a change. This includes replenishing commodities, and adding and removing personnel. Because of time constraints and struggles with the code environment, only deletion of personnel leads to a live refresh. For replenishing commodities, a traditional F5 refresh is required.

Users can also input a higher number of commodities than available when dispensing. This leads to unwarranted behavior. Because of our current implementation, ensuring this check is made properly requires a state array that is complex to design.

Another relevant aspect is the inconsistent usage of warning messages when input fields are left unfiled. Sometimes this is an alert-bar, other times the buttons are disabled, and other times it's highlighting input fields red. This comes down to specific fields being easier to implement certain warning functionality on, whilst others require heavy state manipulation.
