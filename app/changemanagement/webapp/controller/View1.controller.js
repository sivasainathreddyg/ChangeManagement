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
            const email = "sai@gmail.com";
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

            if (!this._pDialog) {
                Fragment.load({
                    name: "com.changemanagement.fragment.RequestCreate",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._pDialog = oDialog;
                    this._pDialog.open();
                }.bind(this));
            } else {
                this._pDialog.open();
            }
        },

        onDialogCancel: function () {
            this._pDialog.close();
        },
        onCreateRequest: function () {
            const oView = this.getView();

            // Create and set data model
            const oCreateModel = new sap.ui.model.json.JSONModel({
                Title: "",
                System: "",
                Type: "",
                ApproverLevel: ""
            });

            oView.setModel(oCreateModel, "CreateRequestModel");

            this.opencreaterequestProjectDialog();
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

        // onDialogSubmit: function () {
        //     const oModel = this.getOwnerComponent().getModel();
        //     const oCreateModel = this.getView().getModel("CreateRequestModel");
        //     const oData = oCreateModel.getData();
        //     var uniqueID = Date.now() % 1000000000 + Math.floor(Math.random() * 1000);
        //     var Email = this.getView().getModel("viewModel").getProperty("/userEmail");


        //     var levelMap = {
        //         "sai@gmail.com": "Level 1, Level 2, Level 3",
        //         "pavan@gmail.com": "Level 1, Level 2",
        //         "siva@gmail.com": "Level 1",
        //         "reddy@gmail.com": " "
        //     };

        //     var approvallevel = levelMap[Email] || "Level 1, Level 2, Level 3, Level 4";
        //     let status = "In Approval";
        //     let validation = "Not Started";

        //     // Special case for reddy
        //     if (Email === "reddy@gmail.com") {
        //         status = "Approved";
        //         validation = "Passed";
        //     }

        //     const email = Email;

        //     const newRequest = {
        //         ID: String(uniqueID),
        //         TITLE: oData.Title,
        //         SYSTEM: oData.System,
        //         TYPE: oData.Type,
        //         STATUS: status,
        //         APPROVERLEVEL: approvallevel,
        //         VALIDATION: validation,
        //         CREATEDBY: email,
        //         CREATEDAT: new Date().toISOString()
        //     };

        //     oModel.callFunction("/CreateRequest", {
        //         method: "POST",
        //         urlParameters: {
        //             requestdata: JSON.stringify(newRequest)
        //         },
        //         success: function (oData) {
        //             try {
        //                 MessageToast.show(oData.CreateRequest);
        //                 this._pDialog.close();
        //                 this.readrequestdata();
        //                 oModel.refresh(true);
        //             } catch (error) {
        //                 MessageBox.show(error);
        //             }
        //         }.bind(this),
        //         error: function (err) {
        //             MessageBox.show(err);
        //         }
        //     });
        // },
        onDialogSubmit: function () {
            const oModel = this.getOwnerComponent().getModel();
            const oCreateModel = this.getView().getModel("CreateRequestModel");
            const oData = oCreateModel.getData();
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
                APPROVERLEVEL: approvallevel,
                VALIDATION: validation,
                CREATEDBY: email,
                CREATEDAT: new Date().toISOString()
            };

            oModel.callFunction("/CreateRequest", {
                method: "POST",
                urlParameters: {
                    requestdata: JSON.stringify(newRequest)
                },
                success: function (oData) {
                    try {
                        MessageToast.show(oData.CreateRequest);
                        this._pDialog.close();
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

            const updatedRequestdata = {
                ID: oData.ID,
                APPROVERLEVEL: updatedLevel,
                STATUS: newStatus,
                VALIDATION: validation

            };
            oModel.callFunction("/UpdateReqData", {
                method: "GET",
                urlParameters: {
                    updatedRequest: JSON.stringify(updatedRequestdata)
                },
                success: function (odata) {
                    if (odata.UpdateReqData === "Change request updated successfully") {
                        sap.m.MessageToast.show("Approved")
                        this.readrequestdata();
                    }
                }.bind(this), error: function (err) {
                    sap.m.MessageToast.show(err.UpdateReqData)
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
            oModel.callFunction("/UpdateReqData", {
                method: "GET",
                urlParameters: {
                    updatedRequest: JSON.stringify(updatedRequestdata)
                },
                success: function (odata) {
                    if (odata.UpdateReqData === "Change request updated successfully") {
                        sap.m.MessageToast.show("Approved")
                        this.readrequestdata();
                    }
                }.bind(this), error: function (err) {
                    sap.m.MessageToast.show(err.UpdateReqData)
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


        // this.getView().getModel().create("/ChangeRequests", newRequest, {
        //     success: () => {
        //         MessageToast.show("Request Created");
        //         this._pDialog.close();
        //     },
        //     error: (err) => {
        //         MessageBox.error("Error creating request");
        //     }
        // });
        // getHighestLevel: function (approverLevel) {
        //     if (!approverLevel) return "Approved ";
        //     const levels = approverLevel.split(",").map(l => l.trim());
        //     return levels[levels.length - 1];
        // },
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
        // isUserAllowedToApprove: function (approverLevel, status, userLevel) {
        //     if (!approverLevel || !userLevel || status !== "In Approval") return false;
        //     const levels = approverLevel.split(",").map(s => s.trim());
        //     const currentLevel = levels[levels.length - 1]; // currently needed approver
        //     return userLevel === currentLevel;
        // },

        // isAlreadyApprovedForUser: function (approverLevel, status, userLevel) {
        //     if (!approverLevel || !userLevel || status !== "In Approval") return false;

        //     const levels = approverLevel.split(",").map(s => s.trim());

        //     // If user level is NOT the current one, AND
        //     // user's level appears after the last one in list => already approved
        //     const allLevels = ["Level 1", "Level 2", "Level 3", "Level 4"];

        //     const userIndex = allLevels.indexOf(userLevel);
        //     const currentIndex = allLevels.indexOf(levels[levels.length - 1]);

        //     return userIndex > currentIndex;
        // }

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
        }








    });
});