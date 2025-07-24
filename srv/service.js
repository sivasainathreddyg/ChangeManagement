// const cds = require("@sap/cds")
// module.exports = srv => {
//     // srv.on("CreateRequest", async req => {
//     //     try {
//     //         if (!req.data || !req.data.requestdata) {
//     //             return { error: "Missing Request data" };
//     //         }

//     //         let newcreaterequestdata;
//     //         try {
//     //             newcreaterequestdata = JSON.parse(req.data.requestdata);
//     //         } catch (error) {
//     //             return { error: "Invalid Request data format" };
//     //         }

//     //         await cds.transaction(req).run(
//     //             INSERT.into("CHANGEMANAGEMENT_CHANGEREQUESTS").entries(newcreaterequestdata)
//     //         );

//     //         return { value: "Request data created successfully" };
//     //     } catch (error) {
//     //         console.error("Error creating Request:", error);
//     //         return { error: "Failed to create Request" };
//     //     }
//     // });
//     srv.on("CreateRequest", async (req) => {
//         const db = cds.transaction(req);

//         try {
//             const { requestdata, filedata } = req.data || {};

//             if (!requestdata) {
//                 return "Missing request data";
//             }

//             let requestData, fileData;
//             try {
//                 requestData = JSON.parse(requestdata);
//                 if (filedata) {
//                     fileData = JSON.parse(filedata);
//                 }
//             } catch (e) {
//                 console.error("Invalid JSON input:", e);
//                 return "Invalid JSON format in request or file data";
//             }

//             try {
//                 await db.run(INSERT.into("CHANGEMANAGEMENT_CHANGEREQUESTS").entries(requestData));
//             } catch (e) {
//                 console.error("Error inserting CHANGEREQUEST:", e);
//                 throw e;
//             }

//             if (fileData && fileData.CONTENT) {
//                 try {
//                     if (typeof fileData.CONTENT === "string") {
//                         fileData.CONTENT = Buffer.from(fileData.CONTENT, "base64");
//                     }

//                     await db.run(INSERT.into("CHANGEMANAGEMENT_MEDIAFILE").entries(fileData));
//                 } catch (e) {
//                     console.error("Error inserting MEDIAFILE:", e);
//                     throw e;
//                 }
//             }

//             return "Request created successfully" + (fileData ? " with attachment." : " without attachment.");
//         } catch (err) {
//             console.error("Transaction failed and rolled back:", err);
//             return "Failed to create request or file. Transaction rolled back.";
//         }
//     });


//     srv.on("ReadReqdata", async (req) => {
//         try {
//             const result = await cds.transaction(req).run(
//                 SELECT.from("CHANGEMANAGEMENTSERVICE_CHANGEREQUESTVIEW"))
//             if (result) {
//                 return { value: JSON.stringify(result) };
//             }

//         } catch (error) {
//             console.error("Error reading requests:", error);
//             req.error(500, "Failed to fetch requests");
//         }
//     });
//     srv.on("FilterOperator", async (req) => {
//         try {
//             const { System, Type, Status } = JSON.parse(req.data.filterdata);

//             const whereClause = {};
//             if (System && System !== "All") whereClause.SYSTEM = System;
//             if (Type && Type !== "All") whereClause.TYPE = Type;
//             if (Status && Status !== "All") whereClause.STATUS = Status;

//             const result = await cds.transaction(req).run(
//                 SELECT.from("CHANGEMANAGEMENTSERVICE_CHANGEREQUESTVIEW").where(whereClause)
//             );

//             return { value: JSON.stringify(result) };

//         } catch (error) {
//             console.error("Error reading requests:", error);
//             req.error(500, "Failed to fetch requests");
//         }
//     });


//     srv.on("Rejectionnote", async (req) => {
//         try {
//             var requestId = req.data.ID;
//             const result = await cds.transaction(req).run(
//                 SELECT.from("CHANGEMANAGEMENT_REJECTIONLOG").where({ REQUESTID_ID: requestId }))
//             if (result) {
//                 return { value: JSON.stringify(result) };
//             }

//         } catch (error) {
//             console.error("Error reading rejectionlog:", error);
//             req.error(500, "Failed to fetch rejectionlog");
//         }
//     })

//     srv.on("UpdateReqDataApprove", async (req) => {
//         try {
//             const updatedata = JSON.parse(req.data.updatedRequest);
//             const Id = updatedata.ID;

//             const updatePayload = {
//                 APPROVERLEVEL: updatedata.APPROVERLEVEL,
//                 STATUS: updatedata.STATUS,
//                 VALIDATION:updatedata.VALIDATION,
//                 APPROVEDDATE:updatedata.APPROVEDDATE
//             };

//             if (updatedata.NOTAPPLICABLE) {
//                 updatePayload.NOTAPPLICABLE = updatedata.NOTAPPLICABLE;
//             }

//             await cds.update('CHANGEMANAGEMENT_CHANGEREQUESTS')
//                 .set(updatePayload)
//                 .where({ ID: Id });

//             return 'Change request updated successfully';
//         } catch (err) {
//             console.error("Error updating Change request:", err);
//             return req.error(500, "Error updating Change request.");
//         }
//     });
//     srv.on("UpdateReqData", async (req) => {
//         try {
//             const Updateddata = JSON.parse(req.data.updateddata);
//             const Id = Updateddata.ID;
//             const Updatedpayload = {
//                 TITLE: Updateddata.Title,
//                 SYSTEM: Updateddata.System,
//                 TYPE: Updateddata.Type,
//                 APPROVERSYSTEM: Updateddata.ApproverSystem,
//                 COMMITID:Updateddata.Commitid,
//                 DESCRIPTION:Updateddata.description
//             }
//             await cds.update('CHANGEMANAGEMENT_CHANGEREQUESTS').set(Updatedpayload).where({ ID: Id });
//             return 'Change request updated successfully';
//         } catch (err) {
//             console.error("Error updating Change request:", err);
//             return req.error(500, "Error updating Change request.");
//         }
//     })

//     srv.on("UpdateReqDataReject", async (req) => {
//         try {
//             const data = JSON.parse(req.data.RejectupdateRequest);

//             if (!data) {
//                 return "Missing request data";
//             }

//             await cds.update("CHANGEMANAGEMENT_CHANGEREQUESTS")
//                 .set({
//                     APPROVERLEVEL: data.APPROVERLEVEL,
//                     STATUS: data.STATUS,
//                     VALIDATION: data.VALIDATION
//                 })
//                 .where({ ID: data.REQUESTID_ID })

//             const rejectionLogEntry = {
//                 // ID: cds.utils.uuid(), 
//                 ID: data.ID,
//                 REQUESTID_ID: data.REQUESTID_ID,
//                 REJECTEDBY: data.REJECTEDBY,
//                 REJECTEDLEVEL: data.REJECTEDLEVEL,
//                 REJECTIONCOMMENT: data.REJECTIONCOMMENT,
//                 REJECTEDAT: data.REJECTEDAT
//             };

//             await cds.transaction(req).run(
//                 INSERT.into("CHANGEMANAGEMENTSERVICE_REJECTIONLOG").entries(rejectionLogEntry)
//             );

//             return "Rejection processed successfully";

//         } catch (error) {
//             console.error("Error in UpdateReqDataReject:", error);
//             req.error(500, "Internal server error while rejecting request");
//         }
//     });



// }









// File: /srv/changemanagement-service.js
const cds = require('@sap/cds');
// const SequenceHelper = require("./library/SequenceHelper");

module.exports = cds.service.impl(async function () {

    this.before('CREATE', 'MediaFile', req => {
        const id = cds.utils.uuid(); // Generate UUID manually if not auto
        req.data.ID = id;
        req.data.url = `/v2/odata/v4/change-management/MediaFile(${id})/content`;
    });


    this.before('READ', 'Files', req => {
        //check content-type
        console.log('content-type: ', req.headers['content-type'])
    })


    this.on("CreateRequest", async (req) => {
        const db = cds.transaction(req);

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

    /**
     * ReadReqdata handler
     */
    this.on("ReadReqdata", async (req) => {
        try {
            const result = await cds.transaction(req).run(
                SELECT.from("CHANGEMANAGEMENTSERVICE_CHANGEREQUESTVIEW")
            );
            return { value: JSON.stringify(result) };
        } catch (error) {
            console.error("Error reading requests:", error);
            req.error(500, "Failed to fetch requests");
        }
    });

    /**
     * FilterOperator handler
     */
    this.on("FilterOperator", async (req) => {
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
            console.error("Error filtering requests:", error);
            req.error(500, "Failed to fetch filtered requests");
        }
    });

    this.on("exportFilterData", async (req) => {
        try {
            const { startDate, endDate } = req.data;

            const from = new Date(startDate);
            const to = new Date(endDate);

            // Strip time and set full-day range
            const fromDate = from.toISOString().slice(0, 19);
            const toDate = to.toISOString().slice(0, 19);
            const results = await cds.run(
                SELECT.from("CHANGEMANAGEMENTSERVICE_CHANGEREQUESTVIEW").where`
                   CREATEDAT  >= ${fromDate} and 
                    CREATEDAT  <= ${toDate}`
            );

            return { value: JSON.stringify(results) };
        } catch (error) {
            console.error("Export Filter Error:", error);
            return req.error(500, "Failed to export filtered data.");
        }
    })

    /**
     * Rejectionnote handler
     */
    this.on("Rejectionnote", async (req) => {
        try {
            const requestId = req.data.ID;
            const result = await cds.transaction(req).run(
                SELECT.from("CHANGEMANAGEMENT_REJECTIONLOG").where({ REQUESTID_ID: requestId })
            );
            return { value: JSON.stringify(result) };
        } catch (error) {
            console.error("Error reading rejection log:", error);
            req.error(500, "Failed to fetch rejection log");
        }
    });

    this.on("Deletereqdata", async (req) => {
        try {
            const requestId = req.data.ID;
            await cds.transaction(req).run(DELETE.from("CHANGEMANAGEMENT_CHANGEREQUESTS").where({ ID: requestId }))
            return "delete sucessfully"
        } catch (err) {
            console.error("Error reading rejection log:", err);
            req.error(500, "Failed to fetch rejection log");
        }
    })

    /**
     * UpdateReqDataApprove handler
     */
    this.on("UpdateReqDataApprove", async (req) => {
        try {
            const updatedata = JSON.parse(req.data.updatedRequest);
            const Id = updatedata.ID;

            const updatePayload = {
                APPROVERLEVEL: updatedata.APPROVERLEVEL,
                STATUS: updatedata.STATUS,
                VALIDATION: updatedata.VALIDATION,

            };
            if (updatedata.APPROVEDDATE) {
                updatePayload.APPROVEDDATE = updatedata.APPROVEDDATE
            }

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

    /**
     * UpdateReqData handler
     */
    this.on("UpdateReqData", async (req) => {
        try {
            const Updateddata = JSON.parse(req.data.updateddata);
            const Id = Updateddata.ID;
            const Updatedpayload = {
                TITLE: Updateddata.Title,
                SYSTEM: Updateddata.System,
                TYPE: Updateddata.Type,
                APPROVERSYSTEM: Updateddata.ApproverSystem,
                COMMITID: Updateddata.Commitid,
                DESCRIPTION: Updateddata.description
            };
            await cds.update('CHANGEMANAGEMENT_CHANGEREQUESTS').set(Updatedpayload).where({ ID: Id });
            return 'Change request updated successfully';
        } catch (err) {
            console.error("Error updating Change request:", err);
            return req.error(500, "Error updating Change request.");
        }
    });

    /**
     * UpdateReqDataReject handler
     */
    this.on("UpdateReqDataReject", async (req) => {
        try {
            const data = JSON.parse(req.data.RejectupdateRequest);
            if (!data) return "Missing request data";

            await cds.update("CHANGEMANAGEMENT_CHANGEREQUESTS")
                .set({
                    APPROVERLEVEL: data.APPROVERLEVEL,
                    STATUS: data.STATUS,
                    VALIDATION: data.VALIDATION
                })
                .where({ ID: data.REQUESTID_ID });

            const rejectionLogEntry = {
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

});
