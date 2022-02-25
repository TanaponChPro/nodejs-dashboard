var mysql = require('mysql');

var condb = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ParkPlam-87",
    database: "EakWServerDB"
});


condb.connect(function (err) {
    if (err) throw err;

    condb.query("SELECT * FROM `EakWServerDB`.`JobTacking`", function (err, res) {
        if (err) throw err;
        let jobtacking = [];
        let ir = 1
        res.forEach(function (eachRow) {
            jobtacking.push([
                ir++,
                eachRow.JobNumber,
                eachRow.TID,
                eachRow.Bank,
                eachRow.Contact,
                eachRow.PhoneNo,
                eachRow.SerialNoEDC,
                eachRow.SerialNoBase,
                eachRow.SerialNoPinpad,
                eachRow.SerialNoScanner,
                eachRow.SerialNoHub,
                eachRow.SerialNoSim,
                eachRow.ReturnNoEDC,
                eachRow.ReturnNoBase,
                eachRow.ReturnNoPinpad,
                eachRow.ReturnNoScanner,
                eachRow.ReturnNoHub,
                eachRow.ReturnNoSim,
                eachRow.Accessory,
                eachRow.Remark,
                eachRow.RecordDateTime,
                eachRow.TackDate,
                eachRow.TackTime,
                eachRow.LastStatus,
                eachRow.AdminName,
                eachRow.TechnicName,
                eachRow.ImpFileName,
                eachRow.Comment
            ]);
        });
        // console.log(JSON.stringify(jobtacking));
        for (const i in jobtacking) {
            parm = jobtacking[i][1]
            var amountRecord = -100;
            checkJobNumber(parm, function (result) {
                amountRecord = result;
                // console.log("row = " + jobtacking[i][0] + ": JobNO = " + jobtacking[i][1] + ": amountRecord =  " + amountRecord);
            });
        }


        // if (amountRecord == 0) {
        //     // insertJobImport();
        //     let sql = ""
        //     sql += ""
        //     sql += " INSERT INTO `EakWServerDB`.`jobimport` ("
        //         sql += "     `JobNo`,`TID`,`Bank`,`SerialNoEDC`,`TechnicName`,`RecordDateTime`,"
        //         sql += " `TackDate`,`UpdateDateTime`,`JobType`,`JobStatus`,`Remark`) "
        //         sql += " SELECT "
        //         sql += " JobNumber,TID,Bank,SerialNoEDC,TechnicName,RecordDateTime,"
        //         sql += " TackDate,NULL,substring(JobNumber,1,3) as JobType, Resultcode, Remark"
        //         sql += " FROM `EakWServerDB`.`jobtacking`"
        //         sql += " WHERE JobNumber = "
        //     connect.query(query, [jobtackings], (err, res) => {
        //         if (err) throw err;
        //         console.log("INSERT INTO jobtacking from sheet 2-คืนเครือง-vendor, Number of records inserted: " + res.affectedRows);
        //     });
        // } else {
        //     // updateJobImport();
        // }


    });

});

function checkJobNumber(tmp, callback){
    // console.log("CheckJobNo = " + tmp)
    var sql = "SELECT JobNo FROM EakWServerDB.jobimport WHERE JobNo = '" + tmp + "'"
    // console.log("sql = " + sql)
    condb.query(sql, function (err, res) {
        if (err) {
            // console.log('result -1');
            return callback(-1)
        } else if (!res.length) {
            // console.log('result 0');
            return callback(0)
        }  else if (!res[0].something) {
            // console.log('result 1');
            return callback(res.length)
        } else {
            // console.log('result 2');
            return callback(res.length)
        }
    })
}
// condb.end();
/*
let parm = process.argv[2];
var stuff_i_want = 5;

console.log(stuff_i_want);
get_info(parm, function (result) {
    stuff_i_want = result;
    console.log(stuff_i_want);
    //rest of your code goes in here
});

function get_info(data, callback) {

    var sql = "SELECT JobNo FROM EakWServerDB.jobimport WHERE JobNo = " + data;

    condb.query(sql, function (err, res) {
        if (err) {
            return console.log('Error1');
        } else if (!res.length) {
            // console.log(results.length);
            // stuff_i_want = results.length;
            // return console.log('Error2');
            return callback(res.length);
        } else if (!res[0].something) {
            return console.log('Error3');
        }


        // console.log(results[0].JobNo);
        // stuff_i_want = results[0].JobNo;

        return callback(results.length);
    })
}
condb.end();
*/

/*--------------------------------------- input data form console --------------------------*/
// let id = process.argv[2]; // pass argument to query
// let sql = `SELECT JobNo FROM EakWServerDB.jobimport WHERE JobNo = ` + id ;

// condb.query(sql, (error, results, fields) => {
//   if (error) return console.error(error.message);
//   console.log('Data received from Db:');
//   console.log(results);

// //   results.render('list',{page_title:"Users - Node.js",data:rows});
// //   console.log("row = " + results.affectedRows);
// });

// condb.end();

// condb.connect(function (err) {

//     var tmpJobNo = 'SERV00001520309'
//     let ir = 0
//     let sql = "SELECT JobNo FROM `EakWServerDB`.`jobimport` WHERE JobNo = `${tmpJobNo}` "
//     ir = await condb.query(sql, function (err, res) {
//         if (err) throw err
//         console.log("row = " + res.affectedRows)
//         return res.affectedRows
//     })


// })
// function sum(num1, num2) {
//     return num1 + num2
// }
// function calculate(num1, num2, sum) { //sum is the call back function
//     return sum(num1, num2);
// }
// var result = calculate(5, 6, sum);
// console.log(result); // 11

// const connDB = require('./db.config')

// const processOrder = async () => {
//     try {
//         await getJobTacking(filename,tackdate)
//     } catch (error) {
//         // handle error
//     }
// }

// function getJobTacking(tmpFileName, tmpTackDate){
//     let sql = "SELECT "
//     sql += " JobNumber,TID,Bank,SerialNoEDC,TechnicName,RecordDateTime,"
// 	sql += " TackDate,NULL,substring(JobNumber,1,3) as JobType, Resultcode, Remark"
//     sql += " FROM `EakWServerDB`.`JobTacking`"
//     sql += " WHERE impfilename = ${tmpFileName} and tackdate ${tmpTackDate}"
//     connDB.query(sql, (err, res) => {
//         if (err) {
//             console.log("error: ", err);
//             result(err, null);
//             return;
//         }

//         if (res.length) {
//             console.log("found tutorial: ", res[0]);
//             result(null, res[0]);
//             return;
//         }

//         // not found Tutorial with the id
//         result({ kind: "not_found" }, null);
//     })
// }