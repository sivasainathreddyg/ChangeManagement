sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], (Controller, JSONModel, Fragment, MessageToast, MessageBox) => {
    "use strict";
    var that = this;

    return Controller.extend("com.changemanagement.controller.View1", {
        onInit() {

            // const viewModel = new JSONModel({ userLevel: "Level 4",isApprover: true });
            const viewModel = new JSONModel({ userLevel: "", isApprover: false, isAdmin: false });
            this.getView().setModel(viewModel, "viewModel");
            const email = "user1@gmail.com";
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
                        this.readrequestdata();

                    }
                });

            }
            var oModel = new sap.ui.model.json.JSONModel({
                Roles: [
                    { Category: "SBP", Key: "VCDE", Text: "VCDE SBP Development" },
                    { Category: "SBP", Key: "VCPR", Text: "VCPR SBP Production" },
                    { Category: "SBP", Key: "VCDT", Text: "VCDT SBP DevTest" },
                    { Category: "SBP", Key: "VCT1", Text: "VCT1 SBP Test1" },
                    { Category: "SBP", Key: "VCT2", Text: "VCT2 SBP Test2" },
                    { Category: "CLIENT 1", Key: "SCT", Text: "SCT" },
                    { Category: "CLIENT 1", Key: "SCP", Text: "SCP" }
                ]
            });
            this.getView().setModel(oModel, "rolesModel");


        },
        onThemeSwitch: function (oEvent) {
            const bIsDark = oEvent.getParameter("state");
            const newTheme = bIsDark ? "sap_horizon_dark" : "sap_horizon";
            sap.ui.getCore().applyTheme(newTheme);
            // localStorage.setItem("selectedTheme", newTheme); // Optional: persist selection
        },

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
                Commitid: oData.COMMITID,
                description: oData.DESCRIPTION,

            };
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/mode", "Update");
            var oCreateModel = new JSONModel(selectedData);
            this.getView().setModel(oCreateModel, "CreateRequestModel");

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

        },
        onApproverLevelChange: function (oEvent) {
            var SelectedLevel = oEvent.getSource().getSelectedKey();
            const viewModel = this.getView().getModel("viewModel");
            viewModel.setProperty("/userLevel", SelectedLevel);
            viewModel.setProperty("/isApprover", true);
            this.readrequestdata();

        },
        readrequestdata: function () {
            const oDatePicker = this.byId("monthPicker");
            const selectedDate = oDatePicker.getDateValue();
            let fromDate, toDate;
            if (selectedDate) {
                const FromDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const ToDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

                fromDate = FromDate.toISOString(); 
                toDate = ToDate.toISOString();

            } else {
                const today = new Date();
                const past30Days = new Date();
                past30Days.setDate(today.getDate() - 30);

                fromDate = past30Days.toISOString();
                toDate = today.toISOString();
            }
            const userEmail = this.getView().getModel("viewModel").getProperty("/userEmail");
            const isAdmin = this.getView().getModel("viewModel").getProperty("/isAdmin");
            const isApprover = this.getView().getModel("viewModel").getProperty("/isApprover");

            const oModel = this.getOwnerComponent().getModel();
            oModel.callFunction("/ReadReqdata", {
                method: "GET",
                urlParameters: {
                    fromDate: fromDate,
                    toDate: toDate,
                    email: userEmail,
                    isAdmin: isAdmin,
                    isApprover: isApprover
                },

                success: function (oData) {
                    var parsedreqdata = JSON.parse(oData.ReadReqdata);
                    const counts = {
                        inApproval: 0,
                        approved: 0,
                        rejected: 0
                    };
                    
                    parsedreqdata.forEach(item => {
                        const status = (item.STATUS || "").toLowerCase();
                        if (status === "in approval") {
                            counts.inApproval++;
                        } else if (status === "approved") {
                            counts.approved++;
                        } else if (status === "rejected") {
                            counts.rejected++;
                        }
                    });
                    
                    // this.getView().setModel(new sap.ui.model.json.JSONModel(counts), "counts");
                    var countsModel=new sap.ui.model.json.JSONModel(counts);
                    this.getView().setModel(countsModel,"counts")
                    var reqModel = new sap.ui.model.json.JSONModel(parsedreqdata);
                    this.getView().setModel(reqModel, "tablereqmodel")

                }.bind(this),
                error: function (err) {
                    sap.m.MessageBox.error("Failed to load request data.");
                    console.error("OData error:", err);

                }
            })

        },
        onMonthChange: function (oEvent) {
            const oDatePicker = oEvent.getSource();
            const selectedDate = oDatePicker.getDateValue(); // JavaScript Date object

            if (!selectedDate) return;

            // Calculate the first and last day of the selected month
            const fromDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const toDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

            const fromDateStr = fromDate.toISOString(); // CAP expects ISO format
            const toDateStr = toDate.toISOString();

            const viewModel = this.getView().getModel("viewModel");
            const email = viewModel.getProperty("/userEmail");
            const isAdmin = viewModel.getProperty("/isAdmin");
            const isApprover = viewModel.getProperty("/isApprover");

            const oModel = this.getOwnerComponent().getModel();

            oModel.callFunction("/ReadReqdata", {
                method: "GET",
                urlParameters: {
                    fromDate: fromDateStr,
                    toDate: toDateStr,
                    email: email,
                    isAdmin: isAdmin,
                    isApprover: isApprover
                },
                success: (oData) => {
                    var parsedreqdata = JSON.parse(oData.ReadReqdata);
                    const counts = {
                        inApproval: 0,
                        approved: 0,
                        rejected: 0
                    };
                    
                    parsedreqdata.forEach(item => {
                        const status = (item.STATUS || "").toLowerCase();
                        if (status === "in approval") {
                            counts.inApproval++;
                        } else if (status === "approved") {
                            counts.approved++;
                        } else if (status === "rejected") {
                            counts.rejected++;
                        }
                    });
                    var countsModel=new sap.ui.model.json.JSONModel(counts);
                    this.getView().setModel(countsModel,"counts")
                    var reqModel = new sap.ui.model.json.JSONModel(parsedreqdata);
                    this.getView().setModel(reqModel, "tablereqmodel")
                },
                error: (err) => {
                    console.error("Error fetching data:", err);
                }
            });
        },
        onfilterchange: function () {
            const oDatePicker = this.byId("monthPicker");
            const selectedDate = oDatePicker.getDateValue();
            let fromDate, toDate;
            if (selectedDate) {
                const FromDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const ToDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

                fromDate = FromDate.toISOString(); 
                toDate = ToDate.toISOString();

            } else {
                const today = new Date();
                const past30Days = new Date();
                past30Days.setDate(today.getDate() - 30);

                fromDate = past30Days.toISOString();
                toDate = today.toISOString();
            }
            const userEmail = this.getView().getModel("viewModel").getProperty("/userEmail");
            const isAdmin = this.getView().getModel("viewModel").getProperty("/isAdmin");
            const isApprover = this.getView().getModel("viewModel").getProperty("/isApprover");

            const System = this.byId("systemFilter").getSelectedKey();
            const Type = this.byId("typeFilter").getSelectedKey();
            const Status = this.byId("statusFilter").getSelectedKey();

            const filters = { System, Type, Status ,userEmail,isAdmin,isApprover,fromDate,toDate};
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

        onFileUploadChange: async function (oEvent) {
            // var oFileUploader = this.byId("fileUploader");
            this.oFile = oEvent.getParameter("files")[0]; // First file selected

            if (this.oFile) {
                const allowedExtensions = ["pdf", "doc", "mtar"];
                const fileName = this.oFile.name.toLowerCase();
                const fileExtension = fileName.split(".").pop();

                if (!allowedExtensions.includes(fileExtension)) {
                    MessageToast.show("Only PDF, DOC, or MTAR files are allowed.");
                    this.oFile = null; // Clear the file so it's not uploaded accidentally
                    return;
                }
            }


        },
        createEntity: function (file, uniqueID) {
            var data = {
                mediaType: file.type,
                fileName: file.name,
                size: file.size,
                changeReq: {
                    ID: String(uniqueID)
                }
            };

            return new Promise((resolve, reject) => {
                $.ajax({
                    url: "/v2/odata/v4/change-management/MediaFile",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    success: function (result) {
                        resolve(result.d.ID);
                    },
                    error: function (err) {
                        reject(err);
                    }
                });
            });
        },
        uploadContent: function (file, id) {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append("file", file);

                fetch(`/v2/odata/v4/change-management/MediaFile(${id})/content`, {
                    method: "PUT",
                    body: formData
                })
                    .then(response => {
                        if (!response.ok) throw new Error("Upload failed");
                        resolve();
                    })
                    .catch(err => reject(err));
            });
        },
        // onFileUploadChanges: function (oEvent) {
        //     var file = oEvent.getParameter("files")[0];
        //     this.uploadedFile = file;
        //     var reader = new FileReader();
        //     reader.onload = function (oEvent) {
        //         var base64String = oEvent.currentTarget.result.split(',')[1];
        //         this.base64Content = base64String;
        //         // this.createfile();
        //     }.bind(this);
        //     reader.readAsDataURL(this.uploadedFile);
        // },
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
                        sap.m.MessageToast.show("Updated ")
                        this.readrequestdata();
                    }
                }.bind(this), error: function (err) {
                    sap.m.MessageToast.show(err.UpdateReqData)
                }
            })

        },

        createChangeRequest: async function () {
            that.busyDialog = new sap.m.BusyDialog();
            that.busyDialog.open();
            const oModel = this.getOwnerComponent().getModel();
            const oCreateModel = this.getView().getModel("CreateRequestModel");
            const oData = oCreateModel.getData();
            const requiredFields = ["Title", "System", "Type", "ApproverSystem", "Commitid", "description"];

            const isValid = requiredFields.every(field => oData[field]);
            if (!isValid) {
                MessageToast.show("Please fill in all required fields.");
                that.busyDialog.close();
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
                COMMITID: oData.Commitid,
                DESCRIPTION: oData.description,
                CREATEDBY: email,
                CREATEDAT: new Date().toISOString()
            };

            // const urlParameters = {
            //     requestdata: JSON.stringify(newRequest)
            // };

            oModel.callFunction("/CreateRequest", {
                method: "POST",
                urlParameters: { requestdata: JSON.stringify(newRequest) },
                success: async function (oData) {
                    try {
                        if (!oData.CreateRequest) {
                            MessageToast.show("Request was not created.");
                            return;
                        }

                        // Check for file and upload if exists

                        const oFile = this.oFile;
                        let uploadSuccess = true;


                        if (oFile) {
                            try {
                                const id = await this.createEntity(oFile, uniqueID);
                                await this.uploadContent(oFile, id);
                            } catch (uploadError) {
                                uploadSuccess = false;
                                await this.deleteRequest(uniqueID);

                                MessageBox.error("File upload failed. Request was rolled back.");
                                that.busyDialog.close();
                                return;
                            }
                        }

                        if (uploadSuccess) {
                            MessageToast.show("Request created successfully ");
                            this.pDialog.close();
                            this.readrequestdata();
                            that.busyDialog.close();
                        }
                    } catch (error) {
                        MessageBox.show("Upload or request processing failed: " + error.message);
                        that.busyDialog.close();
                    }
                }.bind(this),
                error: function (err) {
                    MessageBox.show("Error while creating request: " + err.message);
                    that.busyDialog.close();
                }
            });
        },
        deleteRequest: function (uniqueID) {
            const oModel = this.getOwnerComponent().getModel();
            oModel.callFunction("/Deletereqdata", {
                method: "GET",
                urlParameters: { ID: uniqueID },
                success: function (odata) {

                }, error: function (odata) {

                }
            })

        },
        ondownloadFile: async function (oEvent) {
            that.busyDialog = new sap.m.BusyDialog();
            that.busyDialog.open();

            const oContext = oEvent.getSource().getBindingContext("tablereqmodel");
            const oData = oContext.getObject();
            const sRequestID = oData.ID;

            const sServiceUrl = "/v2/odata/v4/change-management";

            try {
                // Step 1: Get the MediaFile entry using filter by changeReq_ID
                const metadataResponse = await fetch(`${sServiceUrl}/MediaFile?$filter=changeReq_ID eq '${sRequestID}'`);

                if (!metadataResponse.ok) {
                    throw new Error("Failed to fetch media file metadata.");

                }

                const metaData = await metadataResponse.json();
                const results = metaData.d.results;

                if (!results.length) {
                    MessageBox.warning("No attachment found for this request.");
                    that.busyDialog.close();
                    return;

                }

                const mediaFile = results[0];
                const sMediaId = mediaFile.ID;

                // Step 2: Build the download URL using the media file ID
                const sDownloadUrl = `${sServiceUrl}/MediaFile('${sMediaId}')/content`;

                // Step 3: Download the file
                const response = await fetch(sDownloadUrl);
                if (!response.ok) {
                    throw new Error("Download failed.");

                }

                const blob = await response.blob();
                const contentType = response.headers.get("Content-Type") || "application/octet-stream";
                // Extract filename from response header
                // let fileName = `file_${sMediaId}`;
                // const disposition = response.headers.get("Content-Disposition");
                // if (disposition && disposition.includes("filename=")) {
                //     fileName = disposition.split("filename=")[1].replace(/"/g, "");
                // }

                let fileName = `file_${sMediaId}`;
                const disposition = response.headers.get("Content-Disposition");
                if (disposition && disposition.includes("filename=")) {
                    const parts = disposition.split("filename=");
                    fileName = parts[1].replace(/['"]/g, "").trim();
                } else {
                    // Default extension fallback
                    if (contentType === "application/pdf") {
                        fileName += ".pdf";
                    } else if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                        fileName += ".docx";
                    } else if ("mtar" === results[0].fileName.split('.')[1]) {
                        fileName += ".mtar";
                    } else {
                        fileName += ".mtar";
                    }
                }

                // Trigger browser download
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                that.busyDialog.close();

            } catch (err) {
                MessageBox.error("Error downloading file: " + err.message);
                that.busyDialog.close();
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
            const updatedRequestdata = {
                ID: oData.ID,
                APPROVERLEVEL: updatedLevel,
                STATUS: newStatus,
                VALIDATION: validation,

            };
            if (levels.length === 0) {
                const approveddate = new Date().toISOString();
                updatedRequestdata.APPROVEDDATE = approveddate;
            }
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
        onDateRangeChange: function (oEvent) {
            const oViewModel = this.getView().getModel("viewModel");
            const oDateRange = oEvent.getSource();
            const oFromDate = oDateRange.getDateValue();
            const oToDate = oDateRange.getSecondDateValue();

            oViewModel.setProperty("/fromDate", oFromDate);
            oViewModel.setProperty("/toDate", oToDate);
        },
        onExportToExcel: async function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oModel = this.getOwnerComponent().getModel();
            const FromDate = oViewModel.getData().fromDate;
            const ToDate = oViewModel.getData().toDate;

            const that = this;

            oModel.callFunction("/exportFilterData", {
                method: "GET",
                urlParameters: { startDate: FromDate, endDate: ToDate },
                success: function (odata) {
                    that.handleExcelExport(odata.exportFilterData);
                },
                error: function (err) {
                    sap.m.MessageBox.error("Failed to load request data.");
                    console.error("OData error:", err);
                }
            });
        },

        handleExcelExport: async function (data) {
            const parsedData = JSON.parse(data);
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Filtered Requests");

            const columns = [
                { header: "ID", key: "ID", width: 15 },
                { header: "Title", key: "TITLE", width: 30 },
                { header: "Type", key: "TYPE", width: 15 },
                { header: "System", key: "SYSTEM", width: 15 },
                { header: "Commit ID", key: "COMMITID", width: 20 },
                { header: "Description", key: "DESCRIPTION", width: 40 },
                { header: "Created By", key: "CREATEDBY", width: 25 },
                { header: "Created At", key: "CREATEDAT", width: 25 },
                { header: "Approver Level", key: "APPROVERLEVEL", width: 20 },
                { header: "Approver System", key: "APPROVERSYSTEM", width: 20 },
                { header: "Rejected At", key: "REJECTEDAT", width: 25 },
                { header: "Rejected By", key: "REJECTEDBY", width: 25 },
                { header: "Rejected Level", key: "REJECTEDLEVEL", width: 20 },
                { header: "Rejection Comment", key: "REJECTIONCOMMENT", width: 40 },
                { header: "Status", key: "STATUS", width: 15 },
                { header: "Validation", key: "VALIDATION", width: 15 },
            ];
            sheet.columns = columns;

            parsedData.forEach((entry) => {
                sheet.addRow(entry);
            });

            sheet.getRow(1).font = { bold: true };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            saveAs(blob, "Filtered_Requests.xlsx");
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

        },
        isVisibleForAdminCreate: function (isAdmin, mode) {
            return isAdmin && mode === "Create";
        }


    });
});