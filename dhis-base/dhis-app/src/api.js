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