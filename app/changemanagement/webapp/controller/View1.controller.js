sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], (Controller, JSONModel, Fragment, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.changemanagement.controller.View1", {
        onInit() {
            // const viewModel = new JSONModel({ userLevel: "Level 4",isApprover: true });
            const viewModel = new JSONModel({ userLevel: "", isApprover: false, isAdmin: false });
            this.getView().setModel(viewModel, "viewModel");
            const email = "admin@gmail.com";
            if (email === "admin@gmail.com") {
                viewModel.setProperty("/isAdmin", true);
                viewModel.setProperty("/userEmail", email);
            } else {
                viewModel.setProperty("/userEmail", email);
                const oModel = this.getOwnerComponent().getModel();
                oModel.read("/Approvers", {
                    filters: [new sap.ui.model.Filter("Email", "EQ", email)],
                    success: (data) => {
                        if (data.results.length > 0) {
                            viewModel.setProperty("/userLevel", data.results[0].Level);
                            viewModel.setProperty("/isApprover", true);
                        }
                    }
                });
                this.readrequestdata();
            }
            var oModel = new sap.ui.model.json.JSONModel({
                Roles: [
                    { Category: "SBP", Key: "VCDE", Text: "VCDE" },
                    { Category: "SBP", Key: "VCPR", Text: "VCPR" },
                    { Category: "SBP", Key: "VCDT", Text: "VCDT" },
                    { Category: "SBP", Key: "VCT1", Text: "VCT1" },
                    { Category: "SBP", Key: "VCT2", Text: "VCT2" },
                    { Category: "CLIENT 1", Key: "SCT", Text: "SCT" },
                    { Category: "CLIENT 1", Key: "SCP", Text: "SCP" }
                ]
            });
            this.getView().setModel(oModel, "rolesModel");


        },
        // onInit: function () {
        //     const viewModel = new JSONModel({ userEmail: "", userLevel: "", isApprover: false });
        //     this.getView().setModel(viewModel, "viewModel");

        //     const email = sap.ushell.Container.getUser().getEmail();
        //     viewModel.setProperty("/userEmail", email);

        //     const oModel = this.getView().getModel();
        //     oModel.read("/Approvers", {
        //         filters: [new sap.ui.model.Filter("Email", "EQ", email)],
        //         success: (data) => {
        //             if (data.results.length > 0) {
        //                 viewModel.setProperty("/userLevel", data.results[0].Level);
        //                 viewModel.setProperty("/isApprover", true);
        //             }
        //         }
        //     });
        // }

        opencreaterequestProjectDialog: function () {
            var oView = this.getView();

            if (!this.pDialog) {
                Fragment.load({
                    name: "com.changemanagement.fragment.RequestCreate",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this.pDialog = oDialog;
                    this.pDialog.open();
                    sap.ui.getCore().byId("fileUploader").setValue("");
                }.bind(this));
            } else {
                this.pDialog.open();
                sap.ui.getCore().byId("fileUploader").setValue("");
            }
        },
        onTableSelectionChange: function (oEvent) {
            var oTable = this.byId("requestTable");
            var oSelectedItem = oTable.getSelectedItem();
            var oUpdateButton = this.byId("idupdatebtn");

            if (oSelectedItem) {
                oUpdateButton.setEnabled(true);
            } else {
                oUpdateButton.setEnabled(false);
            }
        },
        onUpdateSelectedRow: function () {
            var oTable = this.byId("requestTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Please select a row to update.");
                return;
            }

            var oContext = oSelectedItem.getBindingContext("tablereqmodel");
            var oData = oContext.getObject();


            var selectedData = {
                ID: oData.ID,
                Title: oData.TITLE || "",
                System: oData.SYSTEM || "",
                Type: oData.TYPE || "",
                ApproverLevel: oData.APPROVERLEVEL || "",
                ApproverSystem: oData.APPROVERSYSTEM || "",
                Commitid:oData.COMMITID,
                description: oData.DESCRIPTION,

            };

            // Set update mode
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/mode", "Update");

            // Set model with selected data
            var oCreateModel = new JSONModel(selectedData);
            this.getView().setModel(oCreateModel, "CreateRequestModel");

            // Open fragment
            if (!this.pDialog) {
                this.pDialog = sap.ui.xmlfragment(
                    this.getView().getId(),
                    "com.changemanagement.fragment.RequestCreate",
                    this
                );
                this.getView().addDependent(this.pDialog);
            }

            this.pDialog.open();
        },

        onDialogCancel: function () {
            this.pDialog.close();
        },
        onCreateRequest: function () {
            const oView = this.getView();

            // Create and set data model
            const oCreateModel = new sap.ui.model.json.JSONModel({
                Title: "",
                System: "",
                Type: "",
                ApproverLevel: "",
                ApproverSystem: "",
                Commitid: "",
                description: "",
            });

            oView.setModel(oCreateModel, "CreateRequestModel");
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/mode", "Create");
            this.opencreaterequestProjectDialog();
            // sap.ui.getCore().byId("fileUploader").setValue("");
        },
        onApproverLevelChange: function (oEvent) {
            var SelectedLevel = oEvent.getSource().getSelectedKey();
            const viewModel = this.getView().getModel("viewModel");
            viewModel.setProperty("/userLevel", SelectedLevel);
            viewModel.setProperty("/isApprover", true);
            this.readrequestdata();

        },
        readrequestdata: function () {
            const oModel = this.getOwnerComponent().getModel();
            oModel.callFunction("/ReadReqdata", {
                method: "GET",
                success: function (oData) {
                    var parsedreqdata = JSON.parse(oData.ReadReqdata);
                    var reqModel = new sap.ui.model.json.JSONModel(parsedreqdata);
                    this.getView().setModel(reqModel, "tablereqmodel")

                }.bind(this),
                error: function (err) {
                    sap.m.MessageBox.error("Failed to load request data.");
                    console.error("OData error:", err);

                }
            })

        },
        onfilterchange: function () {
            const System = this.byId("systemFilter").getSelectedKey();
            const Type = this.byId("typeFilter").getSelectedKey();
            const Status = this.byId("statusFilter").getSelectedKey();

            const filters = { System, Type, Status };
            const oModel = this.getOwnerComponent().getModel();

            oModel.callFunction("/FilterOperator", {
                method: "GET",
                urlParameters: {
                    filterdata: JSON.stringify(filters)
                },
                success: function (oData) {
                    const parsedreqdata = JSON.parse(oData.FilterOperator);
                    const reqModel = new sap.ui.model.json.JSONModel(parsedreqdata);
                    this.getView().setModel(reqModel, "tablereqmodel");
                }.bind(this),
                error: function (err) {
                    sap.m.MessageBox.error("Failed to load request data.");
                    console.error("OData error:", err);
                }
            });
        },



        onFileUploadChange: function (oEvent) {
            var file = oEvent.getParameter("files")[0];
            this.uploadedFile = file;
            var reader = new FileReader();
            reader.onload = function (oEvent) {
                var base64String = oEvent.currentTarget.result.split(',')[1];
                this.base64Content = base64String;
                // this.createfile();
            }.bind(this);
            reader.readAsDataURL(this.uploadedFile);
        },
        onDialogSubmit: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var sMode = oViewModel.getProperty("/mode");
            var oData = this.getView().getModel("CreateRequestModel").getData();

            if (sMode === "Update") {
                this.updateChangeRequest(oData);
            } else {

                this.createChangeRequest();
            }

            this.pDialog.close();
        },
        updateChangeRequest: function (oData) {
            const oModel = this.getOwnerComponent().getModel();
            oModel.callFunction("/UpdateReqData", {
                method: "GET",
                urlParameters: { updateddata: JSON.stringify(oData) },
                success: function (odata) {
                    if (odata.UpdateReqData === "Change request updated successfully") {
                        sap.m.MessageToast.show("Approved")
                        this.readrequestdata();
                    }
                }.bind(this), error: function (err) {
                    sap.m.MessageToast.show(err.UpdateReqData

                    )
                }
            })

        },

        createChangeRequest: async function () {
            const oFile = this.uploadedFile;

            let ATTACHMENTNAME = "";
            let ATTACHMENTTYPE = "";
            let ATTACHMENTCONTENT = "";
            let hasFile = false;

            if (oFile) {
                try {
                    ATTACHMENTNAME = oFile.name;
                    ATTACHMENTTYPE = oFile.type || "application/x-mtar";
                    ATTACHMENTCONTENT = this.base64Content;
                    hasFile = true;
                } catch (err) {
                    console.error(err);
                    MessageBox.error("File processing failed.");
                    return;
                }
            }

            const oModel = this.getOwnerComponent().getModel();
            const oCreateModel = this.getView().getModel("CreateRequestModel");
            const oData = oCreateModel.getData();
            const requiredFields = ["Title", "System", "Type", "ApproverSystem"];

            const isValid = requiredFields.every(field => oData[field]);
            if (!isValid) {
                MessageToast.show("Please fill in all required fields.");
                return;
            }

            const email = this.getView().getModel("viewModel").getProperty("/userEmail");
            const uniqueID = Date.now() % 1000000000 + Math.floor(Math.random() * 1000);

            let approvallevel = "";
            let status = "In Approval";
            let validation = "Not Started";

            const levelMap = {
                "sai@gmail.com": "Level 1, Level 2, Level 3",
                "pavan@gmail.com": "Level 1, Level 2",
                "siva@gmail.com": "Level 1",
                "reddy@gmail.com": ""
            };

            const adminLevelMap = {
                "Level 4": "Level 1, Level 2, Level 3",
                "Level 3": "Level 1, Level 2",
                "Level 2": "Level 1",
                "Level 1": ""
            };

            if (email === "admin@gmail.com") {
                const level = oData.ApproverLevel;
                approvallevel = adminLevelMap[level] || "";
                if (approvallevel === "") {
                    status = "Approved";
                    validation = "Passed";
                }
            } else {
                approvallevel = levelMap[email] || "Level 1, Level 2, Level 3, Level 4";
                if (email === "reddy@gmail.com") {
                    status = "Approved";
                    validation = "Passed";
                }
            }

            const newRequest = {
                ID: String(uniqueID),
                TITLE: oData.Title,
                SYSTEM: oData.System,
                TYPE: oData.Type,
                STATUS: status,
                APPROVERSYSTEM: oData.ApproverSystem,
                APPROVERLEVEL: approvallevel,
                VALIDATION: validation,
                COMMITID:oData.Commitid,
                DESCRIPTION:oData.description,
                CREATEDBY: email,
                CREATEDAT: new Date().toISOString()
            };

            let urlParameters = {
                requestdata: JSON.stringify(newRequest)
            };

            if (hasFile) {
                const filePayload = {
                    ID_ID: String(uniqueID),
                    FILENAME: ATTACHMENTNAME,
                    MEDIATYPE: ATTACHMENTTYPE,
                    CONTENT: ATTACHMENTCONTENT
                };
                urlParameters.filedata = JSON.stringify(filePayload);
            }

            oModel.callFunction("/CreateRequest", {
                method: "POST",
                urlParameters: urlParameters,
                success: function (oData) {
                    try {
                        if (!oData.CreateRequest) {
                            MessageToast.show("Request was not created.");
                            return;
                        }
                        MessageToast.show(oData.CreateRequest);
                        this.pDialog.close();
                        this.readrequestdata();
                        oModel.refresh(true);
                    } catch (error) {
                        MessageBox.show(error.message || error);
                    }
                }.bind(this),
                error: function (err) {
                    MessageBox.show("Error while creating request: " + err.message);
                }
            });
        },

        ondownloadmtarfile: async function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext("tablereqmodel");
            const oData = oContext.getObject();
            const sId = oData.ID;

            const sServiceUrl = "/v2/odata/v4/change-management";
            const sDownloadUrl = `${sServiceUrl}/MediaFile('${sId}')/content`;

            try {

                const metaResponse = await fetch(`${sServiceUrl}/MediaFile('${sId}')`);

                if (metaResponse.status === 404) {
                    MessageBox.warning("No attachment found for this request.");
                    return;
                }

                if (!metaResponse.ok) {
                    throw new Error("Failed to check file existence.");
                }


                const response = await fetch(sDownloadUrl);

                if (!response.ok) {
                    throw new Error("Download failed");
                }


                const blob = await response.blob();


                let fileName = `file_${sId}.mtar`;
                const disposition = response.headers.get("Content-Disposition");
                if (disposition && disposition.indexOf("filename=") !== -1) {
                    fileName = disposition.split("filename=")[1].replace(/"/g, "");
                }

                // Create a link and trigger the download
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

            } catch (err) {
                MessageBox.error("Error downloading file: " + err.message);
            }
        },
        onApprove: function (oEvent) {
            const oModel = this.getOwnerComponent().getModel();
            const viewModel = this.getView().getModel("viewModel");
            const userLevel = viewModel.getProperty("/userLevel");

            const oContext = oEvent.getSource().getBindingContext("tablereqmodel");
            const oData = oContext.getObject();

            let levels = oData.APPROVERLEVEL.split(",").map(l => l.trim());

            // The .filter() method creates a new array containing only the elements that return true for the condition inside it.
            levels = levels.filter(level => level !== userLevel);

            const updatedLevel = levels.join(", ");
            const newStatus = levels.length === 0 ? "Approved" : "In Approval";
            const validation = levels.length === 0 ? "Passed" : "Not Started";
            const approveddate = levels.length === 0 ? new Date().toISOString() : ""

            const updatedRequestdata = {
                ID: oData.ID,
                APPROVERLEVEL: updatedLevel,
                STATUS: newStatus,
                VALIDATION: validation,
                APPROVEDDATE: approveddate

            };
            oModel.callFunction("/UpdateReqDataApprove", {
                method: "GET",
                urlParameters: {
                    updatedRequest: JSON.stringify(updatedRequestdata)
                },
                success: function (odata) {
                    if (odata.UpdateReqDataApprove === "Change request updated successfully") {
                        sap.m.MessageToast.show("Approved")
                        this.readrequestdata();
                    }
                }.bind(this), error: function (err) {
                    sap.m.MessageToast.show(err.UpdateReqDataApprove)
                }
            })
        },
        onNotApplicable: function (oEvent) {
            const oModel = this.getOwnerComponent().getModel();
            const viewModel = this.getView().getModel("viewModel");
            const userLevel = viewModel.getProperty("/userLevel");

            const oContext = oEvent.getSource().getBindingContext("tablereqmodel");
            const oData = oContext.getObject();

            let levels = oData.APPROVERLEVEL.split(",").map(l => l.trim());

            // The .filter() method creates a new array containing only the elements that return true for the condition inside it.
            levels = levels.filter(level => level !== userLevel);

            const updatedLevel = levels.join(", ");
            const newStatus = levels.length === 0 ? "Approved" : "In Approval";
            const validation = levels.length === 0 ? "Passed" : "Not Started";

            const updatedRequestdata = {
                ID: oData.ID,
                APPROVERLEVEL: updatedLevel,
                STATUS: newStatus,
                VALIDATION: validation,
                NOTAPPLICABLE: userLevel

            };
            oModel.callFunction("/UpdateReqDataApprove", {
                method: "GET",
                urlParameters: {
                    updatedRequest: JSON.stringify(updatedRequestdata)
                },
                success: function (odata) {
                    if (odata.UpdateReqDataApprove === "Change request updated successfully") {
                        sap.m.MessageToast.show("Not Applicable")
                        this.readrequestdata();
                    }
                }.bind(this), error: function (err) {
                    sap.m.MessageToast.show(err.UpdateReqDataApprove)
                }
            })
        },

        onReject: function (oEvent) {
            this.selectedContext = oEvent.getSource().getBindingContext("tablereqmodel");

            if (!this.pRejectionDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.changemanagement.fragment.RejectionDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.pRejectionDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this.pRejectionDialog.open();
            }
        },
        onpressrejectnote: function (oEvent) {
            const oView = this.getView();
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("tablereqmodel");
            const rowData = oContext.getObject();
            const requestId = rowData.ID;

            // Load fragment if not already loaded
            if (!this.oRejectNoteDialog) {
                Fragment.load({
                    name: "com.changemanagement.fragment.RejectNoteDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.oRejectNoteDialog = oDialog;
                    oView.addDependent(oDialog);
                    this.loadRejectionReason(requestId);
                    oDialog.open();
                }.bind(this));
            } else {
                this.loadRejectionReason(requestId);
                this.oRejectNoteDialog.open();
            }
        },
        loadRejectionReason: function (requestId) {
            const oModel = this.getOwnerComponent().getModel();

            oModel.callFunction("/Rejectionnote", {
                method: "GET",
                urlParameters: {
                    ID: requestId
                },
                success: function (oData) {
                    var parsedreqdata = JSON.parse(oData.Rejectionnote);
                    const rejectionModel = new sap.ui.model.json.JSONModel(parsedreqdata);
                    this.getView().setModel(rejectionModel, "rejectionModel");

                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to fetch rejection reason.");
                }
            });
        },
        onCloseRejectNoteDialog: function () {
            if (this.oRejectNoteDialog) {
                this.oRejectNoteDialog.close();
            }
        },

        onConfirmReject: function () {
            const comment = this.byId("rejectionCommentInput").getValue();
            if (!comment || comment.trim() === "") {
                MessageBox.error("Rejection comment is required.");
                return;
            }

            this.pRejectionDialog.close();
            this.handleRejection(this.selectedContext, comment);
        },

        onCancelReject: function () {
            this.pRejectionDialog.close();
        },
        handleRejection: function (oEvent, comment) {
            const viewModel = this.getView().getModel("viewModel");
            const userLevel = viewModel.getProperty("/userLevel");
            const userEmail = viewModel.getProperty("/userEmail");
            const oModel = this.getOwnerComponent().getModel();
            var uniqueID = Date.now() % 1000000000 + Math.floor(Math.random() * 1000);

            // const selectedContext = oEvent.getSource().getBindingContext("tablereqmodel");
            const data = this.selectedContext.getObject();

            const updatedLevels = data.APPROVERLEVEL.split(",").map(l => l.trim());
            // const remainingLevels = updatedLevels.filter(l => l !== userLevel);

            const payload = {
                ID: String(uniqueID),
                REQUESTID_ID: data.ID,
                REJECTEDBY: userEmail,
                REJECTEDLEVEL: userLevel,
                REJECTIONCOMMENT: comment,
                REJECTEDAT: new Date().toISOString(),
                APPROVERLEVEL: userLevel,
                STATUS: "Rejected",
                VALIDATION: "Failed"

            };

            oModel.callFunction("/UpdateReqDataReject", {
                method: "GET",
                urlParameters: {
                    RejectupdateRequest: JSON.stringify(payload)
                },
                success: function (odata) {
                    MessageToast.show("Request Rejected.");
                    this.readrequestdata(); // or update row locally
                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to reject request.");
                }
            });
        },

        getHighestLevel: function (approverLevel, status) {
            if (!approverLevel) return "";

            if (status === "Rejected") {
                return approverLevel.trim();
            }

            const levels = approverLevel.split(",").map(l => l.trim());
            return levels[levels.length - 1];
        },
        isUserAllowedToApprove: function (approverLevel, status) {
            const viewModel = this.getView().getModel("viewModel");
            const userLevel = viewModel.getProperty("/userLevel");


            if (!approverLevel || !userLevel || !status) return false;
            if (status === "Rejected") {
                return false; // Don't show buttons if rejected
            }

            const levels = approverLevel.split(",").map(s => s.trim());
            const currentLevel = levels[levels.length - 1];

            return userLevel === currentLevel;
        },
        getApprovedText: function (approverLevel, status, userLevel, NotApplicable) {
            if (!approverLevel || !status || !userLevel) return "";

            if (status === "Rejected") {
                return "Rejected ";
            }
            if (NotApplicable === userLevel) {
                return "NotApplicable"

            }

            const levels = approverLevel.split(",").map(l => l.trim());
            const allLevels = ["Level 1", "Level 2", "Level 3", "Level 4"];

            const userIndex = allLevels.indexOf(userLevel);
            const currentIndex = allLevels.indexOf(levels[levels.length - 1]);

            if (userIndex > currentIndex) {
                return "Approved"
            }
        },

        isApprovedTextVisible: function (approverLevel, status, userLevel, NotApplicable) {
            const text = this.getApprovedText(approverLevel, status, userLevel, NotApplicable);
            return !!text; // Visible only if text is non-empty
        },
        isIconVisible: function (status) {
            return status === "Rejected";
        },
        getNoDataText: function () {
            const viewModel = this.getView().getModel("viewModel");
            const isAdmin = viewModel.getProperty("/isAdmin");
            return isAdmin ? "Select any Approval level" : "No data available";
        },
        getValidationState: function (sValue) {
            if (sValue === "Approved") return "Success";
            if (sValue === "Rejected") return "Error";
            if (sValue === "In Approval") return "Warning"
            return "None";
        },
        formatDateOnly: function (sDateTime) {
            if (!sDateTime) return "";
            return sDateTime.split("T")[0];
        },
        formatDecisionDate: function (sApprovedDate, sRejectedDate, sStatus) {
            if (!sStatus) return "";
        
            let sDate = "";
        
            if (sStatus === "Approved") {
                sDate = sApprovedDate;
            } else if (sStatus === "Rejected") {
                sDate = sRejectedDate;
            } else {
                return ""; 
            }
        
            if (!sDate) return "";
        
            return sDate.split("T")[0];
           
        }
        





    });
});