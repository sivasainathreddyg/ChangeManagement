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
                SELECT.from("CHANGEMANAGEMENTSERVICE_CHANGEREQUESTVIEW"))
            if (result) {
                return { value: JSON.stringify(result) };
            }

        } catch (error) {
            console.error("Error reading requests:", error);
            req.error(500, "Failed to fetch requests");
        }
    });
    srv.on("FilterOperator", async (req) => {
        try {
            const { System, Type, Status } = JSON.parse(req.data.filterdata);

            const whereClause = {};
            if (System && System !== "All") whereClause.SYSTEM = System;
            if (Type && Type !== "All") whereClause.TYPE = Type;
            if (Status && Status !== "All") whereClause.STATUS = Status;

            const result = await cds.transaction(req).run(
                SELECT.from("CHANGEMANAGEMENTSERVICE_CHANGEREQUESTVIEW").where(whereClause)
            );

            return { value: JSON.stringify(result) };

        } catch (error) {
            console.error("Error reading requests:", error);
            req.error(500, "Failed to fetch requests");
        }
    });


    srv.on("Rejectionnote", async (req) => {
        try {
            var requestId = req.data.ID;
            const result = await cds.transaction(req).run(
                SELECT.from("CHANGEMANAGEMENT_REJECTIONLOG").where({ REQUESTID_ID: requestId }))
            if (result) {
                return { value: JSON.stringify(result) };
            }

        } catch (error) {
            console.error("Error reading rejectionlog:", error);
            req.error(500, "Failed to fetch rejectionlog");
        }
    })

    srv.on("UpdateReqData", async (req) => {
        try {
            const updatedata = JSON.parse(req.data.updatedRequest);
            const Id = updatedata.ID;

            const updatePayload = {
                APPROVERLEVEL: updatedata.APPROVERLEVEL,
                STATUS: updatedata.STATUS
            };

            if (updatedata.NOTAPPLICABLE) {
                updatePayload.NOTAPPLICABLE = updatedata.NOTAPPLICABLE;
            }

            await cds.update('CHANGEMANAGEMENT_CHANGEREQUESTS')
                .set(updatePayload)
                .where({ ID: Id });

            return 'Change request updated successfully';
        } catch (err) {
            console.error("Error updating Change request:", err);
            return req.error(500, "Error updating Change request.");
        }
    });


    srv.on("UpdateReqDataReject", async (req) => {
        try {
            const data = JSON.parse(req.data.RejectupdateRequest);

            if (!data) {
                return "Missing request data";
            }

            await cds.update("CHANGEMANAGEMENT_CHANGEREQUESTS")
                .set({
                    APPROVERLEVEL: data.APPROVERLEVEL,
                    STATUS: data.STATUS,
                    VALIDATION: data.VALIDATION
                })
                .where({ ID: data.REQUESTID_ID })

            const rejectionLogEntry = {
                // ID: cds.utils.uuid(), 
                ID: data.ID,
                REQUESTID_ID: data.REQUESTID_ID,
                REJECTEDBY: data.REJECTEDBY,
                REJECTEDLEVEL: data.REJECTEDLEVEL,
                REJECTIONCOMMENT: data.REJECTIONCOMMENT,
                REJECTEDAT: data.REJECTEDAT
            };

            await cds.transaction(req).run(
                INSERT.into("CHANGEMANAGEMENTSERVICE_REJECTIONLOG").entries(rejectionLogEntry)
            );

            return "Rejection processed successfully";

        } catch (error) {
            console.error("Error in UpdateReqDataReject:", error);
            req.error(500, "Internal server error while rejecting request");
        }
    });



}