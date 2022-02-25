const connDB = require("./db.js");

// constructor
const Jobimport = function (Jobimport) {
    this.JobNo = Jobimport.JobNo;
    this.TID = Jobimport.TID;
    this.Bank = Jobimport.Bank;
    this.SerialNoEDC = Jobimport.SerialNoEDC;
    this.TechnicName = Jobimport.TechnicName;
    this.RecordDateTime = Jobimport.RecordDateTime;
    this.TackDate = Jobimport.TackDate;
    this.UpdateDateTime = Jobimport.UpdateDateTime;
    this.JobType = Jobimport.JobType;
    this.JobStatus = Jobimport.JobStatus;
    this.Remark = Jobimport.Remark
};

module.exports = Jobimport;

