const pool = require('./database.config')

async function main() {

    const result = await pool.query("SELECT ImpFileName, DATE_FORMAT(ImportDate,'%Y-%m-%d') AS ImpDate  FROM `EakWServerDB`.`importfilename` WHERE TrantoJobImport = 'N'")

    for (const ir in result) {
        console.log(result[ir].ImpFileName)
        console.log(result[ir].ImpDate)
        let tmpFileName = result[ir].ImpFileName
        let tmpImpDate = result[ir].ImpDate

        let insJobImportResult = await insertJobImport(tmpFileName,tmpImpDate)
        console.log(insJobImportResult)
        // console.log("Insert JobImport complete")
        // insJobImportResult.then(function(res){
        //     console.log(res)
        // })

        let insDeviceResult = await insertDevice(tmpFileName,tmpImpDate)
        console.log(insDeviceResult)
        // console.log("Insert Device complete")
        // insDeviceResult.then(function (res) {
        //      console.log(res) 
        // })

        let insDevHisResult = await insertDeviceHistory(tmpFileName,tmpImpDate)
        console.log(insDevHisResult)
        // console.log("Insert DeviceHistory complete")
        // insDevHisResult.then(function (res) { 
        //     console.log(res) 
        // })

        const updFileImport = await updateFileImport(tmpFileName, tmpImpDate)
        console.log(updFileImport)
        // console.log("Update FileImport complete")
        // updFileImport.then(data => console.log(data))
        // updFileImport.then(function (res) {
        //     console.log(res)
        // })
    }

    // const result = await pool.query("SELECT * FROM `EakWServerDB`.`JobTacking`")
    // console.log(result[0].JobNumber)

    // for (const ir in result) {
    //     const JobImportResult = await insertJobImport(result[ir].JobNumber)
    //     console.log("Insert JobNo: " + result[ir].JobNumber + " into Table JobImport Complete")

    //     // // console.log(result[ir].JobNumber)
    //     // let chkjobno = -1
    //     // chkjobno = await checkJobNo(result[ir].JobNumber)
    //     // //console.log("JobNo: " + result[ir].JobNumber + ", Check: " + chkjobno)
    //     // if (chkjobno == 0) {
    //     //     const insert_result = await insertJobImport(result[ir].JobNumber)
    //     //     console.log("Insert JobNo: " + result[ir].JobNumber + " into Table JobImport Complete")
    //     // } else if (chkjobno > 0) {
    //     //     //const update_result = await updateJobImport()
    //     // } else {

    //     // }
    // }

    // let chkjobno = -1
    // chkjobno = await checkJobNo('SERV00001520258')
    // console.log("JobNo:  SERV00001520258 Check: " + chkjobno)
}

var checkJobNo = (tmpjobno) => {
    var sql = "SELECT JobNo FROM EakWServerDB.jobimport WHERE JobNo = '" + tmpjobno + "'"
    return new Promise(function (resolve, reject) {
        pool.query(sql, (err, res) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (res == null) {
                return reject({ message: "Data is null" });
            }
            //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
            resolve(res.length);
        })
    });
}
var insertJobImport = (pamFileName, pamImpDate) => {
    let = sql = ""
    sql += " INSERT INTO `EakWServerDB`.`Jobimport` ("
    sql += "    `JobNo`,`TID`,`Bank`,`SerialNoEDC`,`TechnicName`,`RecordDateTime`,"
    sql += "    `TackDate`,`UpdateDateTime`,`JobType`,`JobStatus`,`Remark`) "
    sql += " SELECT "
    sql += "    JobNumber,TID,Bank,SerialNoEDC,TechnicName,RecordDateTime,"
    sql += "    TackDate,NULL,substring(JobNumber,1,3) as JobType, IFNULL(Resultcode,0) as JobStatus  , Remark"
    sql += " FROM `EakWServerDB`.`jobtacking` aa"
    sql += " WHERE ImpFileName LIKE '" + pamFileName + "%' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "   AND substring(SheetName,1,1) IN ('1','3')"
    sql += " ON DUPLICATE KEY UPDATE `JobNo` = `aa`.`JobNumber`, `TID`= `aa`.`TID`,"
    sql += "  `Bank` = aa.Bank,`SerialNoEDC` = aa.SerialNoEDC ,  `TechnicName` = aa.TechnicName,"
    sql += "  `RecordDateTime` = aa.RecordDateTime,    `TackDate`= aa.TackDate,  `UpdateDateTime`= aa.RecordDateTime,"
    sql += "  `JobType` = substring(aa.JobNumber,1,3), `JobStatus`= aa.ResultCode, `Remark` = aa.Remark;"

    return new Promise(function (resolve, reject) {
        pool.query(sql, (err, res) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (res == null) {
                return reject({ message: "Data is null" });
            }
            //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
            resolve({ message: "Insert JobImport Complete " });
        })
    });
}

var insertDevice = (pamFileName, pamImpDate) => {
    let = sql = ""
    sql += "  INSERT INTO `EakWServerDB`.`Device` ("
    sql += "      `SerialNo`,`DeviceType`,`UseStatus`,`StockName`,`WhereIsLast`,`Remark`) "
    sql += "  SELECT DISTINCT "
    sql += "      SerialNo, DeviceType, UseStatus, StockName, WhereIsLast, Remark"
    sql += "  FROM ("
    sql += "      SELECT SerialNoEDC AS SerialNo, 'EDC' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "          LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "      FROM `EakWServerDB`.`jobtacking`"
    sql += "       WHERE SerialNoEDC is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "         SELECT SerialNoBase AS SerialNo, 'BASE' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "              LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE SerialNoBase is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "          SELECT SerialNoPinpad AS SerialNo, 'PINPAD' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "              LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE SerialNoPinpad is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "          SELECT SerialNoScanner AS SerialNo, 'SCANNER' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "              LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE SerialNoScanner is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "         SELECT SerialNoHub AS SerialNo, 'HUB' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "              LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE SerialNoHub is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "         SELECT ReturnNoEDC AS SerialNo, 'EDC' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "             LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE ReturnNoEDC is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "         SELECT ReturnNoBase AS SerialNo, 'BASE' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "              LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "          WHERE ReturnNoBase is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "          SELECT ReturnNoPinpad AS SerialNo, 'PINPAD' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "              LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "          WHERE ReturnNoPinpad is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "          SELECT ReturnNoScanner AS SerialNo, 'SCANNER' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "             LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE ReturnNoScanner is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "         SELECT ReturnNoHub AS SerialNo, 'HUB' AS DeviceType, 'Y' AS UseStatus, 'EakW-Asok' AS StockName, "
    sql += "             LastStatus AS WhereIsLast, CONCAT(ImpFileName, DATE_FORMAT(RecordDateTime,'_%Y-%m-%d')) AS Remark"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "          WHERE ReturnNoHub is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     ) AS aa"
    sql += "      ON DUPLICATE KEY UPDATE "
    sql += "          `SerialNo` = aa.SerialNo, `DeviceType` = aa.DeviceType, `StockName` = aa.StockName,"
    sql += "         `WhereIsLast` = aa.WhereIsLast, `Remark` = aa.Remark;"
    return new Promise(function (resolve, reject) {
        pool.query(sql, (err, res) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (res == null) {
                return reject({ message: "Data is null" });
            }
            //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
            resolve({ message: "Insert Device Complete " });
        })
    });
}

var insertDeviceHistory = (pamFileName, pamImpDate) => {
    let = sql = ""
    sql += "     INSERT INTO `EakWServerDB`.`DeviceHistory` ("
    sql += "         `SerialNo`,`TID`,`DeviceType`,`TackDateTime`,"
    sql += "         `LastStatus`,`AdminName`,`TechnicName`,`Activity`)"
    sql += "      SELECT DISTINCT "
    sql += "          `SerialNo`,`TID`,`DeviceType`,`TackDateTime`,`LastStatus`,`AdminName`,`TechnicName`,`Activity`"
    sql += "     FROM ("
    sql += "         SELECT SerialNoEDC AS SerialNo, TID, 'EDC' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE SerialNoEDC IS NOT NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "         SELECT SerialNoBase AS SerialNo, TID, 'BASE' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE SerialNoBase is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "          SELECT SerialNoPinpad AS SerialNo, TID, 'PINPAD' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "          WHERE SerialNoPinpad is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "          SELECT SerialNoScanner AS SerialNo, TID, 'SCANNER' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "          WHERE SerialNoScanner is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "          SELECT SerialNoHub AS SerialNo, TID, 'HUB' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "          WHERE SerialNoHub is not NULL	AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "         SELECT ReturnNoEDC AS SerialNo, TID, 'EDC' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE ReturnNoEDC is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "         SELECT ReturnNoBase AS SerialNo, TID, 'BASE' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE ReturnNoBase is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      UNION ALL "
    sql += "          SELECT ReturnNoPinpad AS SerialNo, TID, 'PINPAD' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "          WHERE ReturnNoPinpad is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "          SELECT ReturnNoScanner AS SerialNo, TID, 'SCANNER' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "          FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE ReturnNoScanner is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "     UNION ALL "
    sql += "          SELECT ReturnNoHub AS SerialNo, TID, 'HUB' AS DeviceType, RecordDateTime AS TackDateTime, LastStatus, 'Tester' AS AdminName, TechnicName, NULL AS Activity"
    sql += "         FROM `EakWServerDB`.`jobtacking`"
    sql += "         WHERE ReturnNoHub is not NULL AND ImpFileName = '" + pamFileName + "' AND DATE_FORMAT(RecordDateTime,'%Y-%m-%d') = '" + pamImpDate + "'"
    sql += "      ) AS aa"

    return new Promise(function (resolve, reject) {
        pool.query(sql, (err, res) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (res == null) {
                return reject({ message: "Data is null" });
            }
            //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
            resolve({ message: "Insert DeviceHistory Complete " });
        })
    });
}

var updateFileImport = (pamFileName, pamImpDate) => {
    let = sql = " UPDATE `EakWServerDB`.`importfilename` SET TrantoJobImport = 'Y' WHERE ImpFileName LIKE '" + pamFileName + "' AND ImportDate = '" + pamImpDate + "';"

    return new Promise(function (resolve, reject) {
        pool.query(sql, (err, res) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (res == null) {
                return reject({ message: "Data is null" });
            }
            //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
            resolve({ message: "Insert importfilename Complete " });
        })
        // pool.query(sql, (err, data) => {
        //     if (err) {
        //         reject(err)
        //         return
        //     }
        //     resolve(data)
        // })
    });
}

main()
