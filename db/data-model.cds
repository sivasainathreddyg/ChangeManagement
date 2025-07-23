// namespace changemanagement;
context changemanagement {

  entity ChangeRequests {
    key ID             : UUID;
        Title          : String(255);
        System         : String(50);
        Type           : String(50);
        Status         : String(50);
        ApproverLevel  : String(200);
        ApproverSystem : String(50);
        Validation     : String(50);
        NotApplicable  : String(50);
        CommitID       : String(50);
        Description    : String;
        ApprovedDate   : Timestamp;
        createdBy      : String(100);
        createdAt      : Timestamp;

  }

 @cds.server.body_parser.limit: '10mb'
  entity MediaFile {
  key ID        : UUID;
      content   : LargeBinary @Core.MediaType : mediaType;
      mediaType : String    @Core.IsMediaType : true;
      fileName  : String;
      url       : String;
      size      : Integer;
      changeReq : Association to ChangeRequests;
}


  entity Approvers {
    key ID    : UUID;
        Email : String(100);
        Level : String(50);
  }

  entity RejectionLog {
    key ID               : UUID;
        RequestID        : Association to ChangeRequests;
        RejectedBy       : String;
        RejectedLevel    : String;
        RejectionComment : String;
        RejectedAt       : Timestamp;
  }
}


@cds.persistence.exists
@cds.persistence.table
entity ChangeRequestView {
  key ID               : UUID;
      TITLE            : String;
      SYSTEM           : String;
      TYPE             : String;
      STATUS           : String;
      APPROVERLEVEL    : String;
      ApproverSystem   : String;
      VALIDATION       : String;
      NotApplicable    : String;
      CREATEDBY        : String;
      CREATEDAT        : Timestamp;
      CommitID         : String(50);
      Description      : String;
      ApprovedDate     : Timestamp;
      REJECTEDBY       : String;
      REJECTIONCOMMENT : String;
      REJECTEDLEVEL    : String;
      REJECTEDAT       : Timestamp;
}
