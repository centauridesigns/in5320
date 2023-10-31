export function postDispenseTransaction() {
    return {
        resource: "dataValueSets",
        type: "create",
        dataSet: "ULowA8V3ucd",
        data: ({ dispenseMutation }) => ({
            dataValues: dispenseMutation,
        }),
    };
}

export function postNewPersonnel(personnelName, personnelAffiliation) {
    return {
        resource: "/dataStore/IN5320-9/" + key,
        type: "create", // create, update, delete
        body: {
            "personnelName": personnelName,
            "personnelAffiliation": personnelAffiliation,
        }
    }
}

export function getUsers() {
    return ({
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
    });
}