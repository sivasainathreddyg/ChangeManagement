sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], (Controller, JSONModel, Fragment, MessageToast) => {
    "use strict";

    return Controller.extend("com.changemanagement.controller.View1", {
        onInit() {
            // const viewModel = new JSONModel({ userLevel: "Level 4",isApprover: true });
            const viewModel = new JSONModel({ userLevel: "", isApprover: false });
            this.getView().setModel(viewModel, "viewModel");
            const email = "sai@gmail.com";
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
                Type: ""
            });

            oView.setModel(oCreateModel, "CreateRequestModel");

            this.opencreaterequestProjectDialog();
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


        onDialogSubmit: function () {
            const oModel = this.getOwnerComponent().getModel();
            const oCreateModel = this.getView().getModel("CreateRequestModel");
            const oData = oCreateModel.getData();
            var uniqueID = Date.now() % 1000000000 + Math.floor(Math.random() * 1000);
            var Email = this.getView().getModel("viewModel").getProperty("/userEmail");

            var levelMap = {
                "sai@gmail.com": "Level 1, Level 2, Level 3",
                "pavan@gmail.com": "Level 1, Level 2",
                "siva@gmail.com": "Level 1",
                "reddy@gmail.com": " "
            };

            var approvallevel = levelMap[Email] || "Level 1, Level 2, Level 3, Level 4";
            let status = "In Approval";
            let validation = "Not Started";

            // Special case for reddy
            if (Email === "reddy@gmail.com") {
                status = "Approved";
                validation = "Passed";
            }

            const email = Email;

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
                        MessageBox.show(error);
                    }
                }.bind(this),
                error: function (err) {
                    MessageBox.show(err);
                }
            });
        },
        onApprove: function (oEvent) {
            const oModel = this.getOwnerComponent().getModel();
            const viewModel = this.getView().getModel("viewModel");
            const userLevel = viewModel.getProperty("/userLevel");

            // Get selected row context
            const oContext = oEvent.getSource().getBindingContext("tablereqmodel");
            const oData = oContext.getObject();

            let levels = oData.APPROVERLEVEL.split(",").map(l => l.trim());

            // The .filter() method creates a new array containing only the elements that return true for the condition inside it.
            levels = levels.filter(level => level !== userLevel);

            // Update fields
            const updatedLevel = levels.join(", ");
            const newStatus = levels.length === 0 ? "Approved" : "In Approval";
            const validation = levels.length === 0 ? "Passed" : "Not Started";

            // Update local model (for instant UI change)
            // oContext.getModel().setProperty(oContext.getPath() + "/APPROVERLEVEL", updatedLevel);
            // oContext.getModel().setProperty(oContext.getPath() + "/STATUS", newStatus);

            // Optional: update VALIDATION field too if needed
            // oContext.getModel().setProperty(oContext.getPath() + "/VALIDATION", ...);

            // Update in backend
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

            // oModel.update("/CHANGEMANAGEMENT_CHANGEREQUESTS(ID=" + oData.ID + ")", updatedRequest, {
            //     success: () => {
            //         sap.m.MessageToast.show("Approved successfully.");
            //         oModel.refresh(true); // refresh table if needed
            //     },
            //     error: (err) => {
            //         sap.m.MessageBox.error("Failed to approve.");
            //         console.error(err);
            //     }
            // });
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
        getHighestLevel: function (approverLevel) {
            if (!approverLevel) return "Approved ";
            const levels = approverLevel.split(",").map(l => l.trim());
            return levels[levels.length - 1];
        },
        isUserAllowedToApprove: function (approverLevel) {
            const viewModel = this.getView().getModel("viewModel");
            const userLevel = viewModel.getProperty("/userLevel");

            if (!approverLevel || !userLevel) return false;

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

        isAlreadyApprovedForUser: function (approverLevel, status, userLevel) {
            if (!approverLevel || !userLevel || status !== "In Approval") return false;

            const levels = approverLevel.split(",").map(s => s.trim());

            // If user level is NOT the current one, AND
            // user's level appears after the last one in list => already approved
            const allLevels = ["Level 1", "Level 2", "Level 3", "Level 4"];

            const userIndex = allLevels.indexOf(userLevel);
            const currentIndex = allLevels.indexOf(levels[levels.length - 1]);

            return userIndex > currentIndex;
        }





    });
});