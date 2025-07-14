using changemanagement from '../db/data-model';

service ChangeManagementService {
  entity ChangeRequests as projection on changemanagement.ChangeRequests;
  entity Approvers      as projection on changemanagement.Approvers;
  action   approveRequest(ID : UUID)              returns String;
  action   rejectRequest(ID : UUID)               returns String;
  action   CreateRequest(requestdata : String)    returns String;
  // action Readdata()                          returns String;
  function ReadReqdata()                          returns String;
  function UpdateReqData(updatedRequest : String) returns String;

}
