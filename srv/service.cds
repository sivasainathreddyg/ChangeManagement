using changemanagement from '../db/data-model';
using {ChangeRequestView} from '../db/data-model';


service ChangeManagementService {
  entity MediaFile         as projection on changemanagement.MediaFile;
  entity ChangeRequests    as projection on changemanagement.ChangeRequests;
  entity Approvers         as projection on changemanagement.Approvers;
  entity RejectionLog      as projection on changemanagement.RejectionLog;
  entity ChangeRequestview as projection on ChangeRequestView;
  action   approveRequest(ID : UUID)                                                   returns String;
  action   rejectRequest(ID : UUID)                                                    returns String;

  // action   CreateRequest(requestdata : String)               returns String;
  action   CreateRequest(requestdata : String)                                         returns String;

  // action Readdata()                          returns String;
  function ReadReqdata(fromDate : DateTime,
                       toDate : DateTime,
                       email : String,
                       isAdmin : Boolean,
                       isApprover : Boolean)                                           returns String;

  
  function UpdateReqDataApprove(updatedRequest : String)                               returns String;
  function UpdateReqDataReject(RejectupdateRequest : String)                           returns String;
  function Rejectionnote(ID : String)                                                  returns String;
  function FilterOperator(filterdata : String)                                         returns String;
  function UpdateReqData(updateddata : String)                                         returns String;
  function exportFilterData(startDate : Date, endDate : Date)                          returns String;
  function Deletereqdata(ID : String)                                                  returns String;

}
