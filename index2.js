const pool = require('./database.config')

async function foo(){
    const result = await pool.query("SELECT * FROM `EakWServerDB`.`JobTacking`")
    console.log(result)
}
foo()