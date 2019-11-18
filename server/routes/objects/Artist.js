const pool = require('../../initialization/database')
const boom = require('@hapi/boom')
module.exports = {

     getArtist(id){
        return new Promise((resolve,reject)=>{
            pool.query("select albumid,artistname from artist where artistid = ?",[id])
            .then(([rows,fields])=>{
                if(rows.length==0){
                    return reject(boom.notFound("Artist not found"))
                }
                return resolve(rows[0])
            })
            .catch(reject)
        })
    }
}