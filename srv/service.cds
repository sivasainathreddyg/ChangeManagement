using changemanagement from '../db/data-model';
using {ChangeRequestView} from '../db/data-model';


service ChangeManagementService {
  entity ChangeRequests    as projection on changemanagement.ChangeRequests;
  entity Approvers         as projection on changemanagement.Approvers;
  entity RejectionLog      as projection on changemanagement.RejectionLog;
  entity ChangeRequestview as projection on ChangeRequestView;
  action   approveRequest(ID : UUID)                         returns String;
  action   rejectRequest(ID : UUID)                          returns String;
  action   CreateRequest(requestdata : String)               returns String;
  // action Readdata()                          returns String;
  function ReadReqdata()                                     returns String;
  function UpdateReqData(updatedRequest : String)            returns String;
  function UpdateReqDataReject(RejectupdateRequest : String) returns String;
  function Rejectionnote(ID : String)                        returns String;
  function FilterOperator(filterdata : String)               returns String;

}
