const pool = require('../../initialization/database')
module.exports = {

     getSong(id){
        return new Promise((resolve,reject)=>{
            pool.query("select s.albumID,albumName,s.artistID,artistName,songID,Name,Date,Plays,Length,dateAdded,trackNumber from song s join artist using (artistid) left join album using (albumid) where songid=?;",[id], function(error, rows, fields) {
                if (error){return reject(error)}
                resolve(rows[0])
             })
        })
    },
    deleteSong(id){

    }
}