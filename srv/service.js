const cds = require("@sap/cds")
module.exports = srv => {
    srv.on("CreateRequest", async req => {
        try {
            if (!req.data || !req.data.requestdata) {
                return { error: "Missing Request data" };
            }

            let newcreaterequestdata;
            try {
                newcreaterequestdata = JSON.parse(req.data.requestdata);
            } catch (error) {
                return { error: "Invalid Request data format" };
            }

            await cds.transaction(req).run(
                INSERT.into("CHANGEMANAGEMENT_CHANGEREQUESTS").entries(newcreaterequestdata)
            );

            return { value: "Request data created successfully" };
        } catch (error) {
            console.error("Error creating Request:", error);
            return { error: "Failed to create Request" };
        }
    });

    srv.on("ReadReqdata", async (req) => {
        try {
            const result = await cds.transaction(req).run(
                SELECT.from("CHANGEMANAGEMENT_CHANGEREQUESTS"))
            if (result) {
                return { value: JSON.stringify(result) };
            }

        } catch (error) {
            console.error("Error reading requests:", error);
            req.error(500, "Failed to fetch requests");
        }
    });

    srv.on("UpdateReqData", async (req) => {
        try {
            const updatedata = JSON.parse(req.data.updatedRequest);
            const Id = updatedata.ID;

            const updatePayload = {
                APPROVERLEVEL: updatedata.APPROVERLEVEL,
                STATUS: updatedata.STATUS,

            };

            await cds.update('CHANGEMANAGEMENT_CHANGEREQUESTS')
                .set(updatePayload)
                .where({ ID: Id });

            return 'Change request updated successfully'
        } catch (err) {
            console.error("Error updating Change request:", err);
            return req.error(500, "Error updating Change request.");
        }
    });


}