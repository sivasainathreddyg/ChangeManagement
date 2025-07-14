namespace changemanagement;

entity ChangeRequests {
  key ID            : UUID;
  Title             : String(255);
  System            : String(50);
  Type              : String(50);
  Status            : String(50);
  ApproverLevel     : String(200);  
  Validation        : String(50);   
  createdBy         : String(100);
  createdAt         : Timestamp;
}

entity Approvers {
  key ID    : UUID;
  Email     : String(100);
  Level     : String(50); 
}