var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var mysql = require('mysql');

var mysql_connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ParkPlam-87",
    database: "EakWServerDB"
});

//สร้าง Function สำหรับ เชื่อมต่อ MySQL โดย รับค่าคำสั่ง sql  และค่าของตัวแปรอยู่ใน place_holder ( เพื่อป้องกัน SQL Injection )
var get_mysql_data = (sql, place_holder) => {
    //กำหนดให้ return  object Promise รอ
    return new Promise(function (resolve, reject) {

        mysql_connection.connect(() => {
            //รันคำสั่ง SQL
            mysql_connection.query(sql, place_holder, (err, result) => {

                if (err) {
                    console.log(err);
                    return reject(err);
                }

                if (result == null) {
                    return reject({ message: "Mysql Error" });
                }
                //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
                resolve(result);

            })

        });

    });
}

/* ถ้าไม่ต้องการทำงานแบบ API
async function getJobTacking(){
    var product;
    try {
        //ให้รอผลจากคำสั่ง SQL SELECT * FROM product ก่อนค่อยทำงานในคำสั่งถัดไป ( ทำงานแบบ synchronous  )
        product = await get_mysql_data("SELECT * FROM `EakWServerDB`.`JobTacking`");
        console.log(product)
    } catch (err) {
        console.log(err);
    }
}
getJobTacking()
*/

//กำหนด Route
app.get('/', async (req, res) => {

    var product;
    try {
        //ให้รอผลจากคำสั่ง SQL SELECT * FROM product ก่อนค่อยทำงานในคำสั่งถัดไป ( ทำงานแบบ synchronous  )
        product = await get_mysql_data("SELECT * FROM `EakWServerDB`.`JobTacking`");
        //console.log(product)
    } catch (err) {
        console.log(err);
    }
    
    //เมื่อได้ข้อมูลในตาราง Product แล้วเราจะเอามา part  ของแต่ละ product
    for (var i = 0; i < product.length; i++) {
        try {

            var sql = `SELECT part_name,product_part.qty,unit_count_name FROM
            part INNER JOIN product_part ON part.part_id=product_part.part_id
            INNER JOIN unit_count ON unit_count.unit_count_id=part.unit_count_id
            WHERE (product_id=?)`;

            var part = await get_mysql_data(sql, [product[i].product_id]);
            product[i]["part"] = part;

        }
        catch (err) {
            console.log(err);
        }

    }
    var html = "";
    for (var i = 0; i < product.length; i++) {  //แสดงชื่อ product
        html += "<h4>" + product[i].product_name + "<h4>";
        html += "<ul>";
        product[i].part.forEach(part_item => {
            //แสดง part และจำนวนที่ใช้ของแต่ละ product
            html += "<li>" + part_item.part_name + " จำนวน " + part_item.qty + " " + part_item.unit_count_name + "</li>";

        });
        html += "</ul>";

        html += "<hr />";
    }
    res.send(html);
    
});

//กรณีไม่พบหน้า
app.get('*', (req, res) => {
    res.status(404).send('Page Not Found');
});

app.listen(port);
console.log("server start");