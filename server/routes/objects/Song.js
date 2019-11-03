const pool = require('../../initialization/database')
const boom = require('@hapi/boom')
module.exports = {

     getSong(id){
        return new Promise((resolve,reject)=>{
            pool.query("select s.albumID,albumName,s.artistID,artistName,songID,Name,Date,Plays,Length,dateAdded,trackNumber from song s join artist using (artistid) left join album using (albumid) where songid=?;",[id])
            .then(([rows,fields])=>{
                if(!rows[0]){
                    return reject(boom.notFound("Song not found"))
                }
                resolve(rows[0])})
            .catch(err=>{reject(boom.boomify(err,{statusCode:500}))})
        })
    },
    deleteSong(id){

    },
    play(id){
        return new Promise((resolve,reject)=>{
            pool.query("update song set plays = plays+1 where songid=?",[id])
            .then(([result,fields])=>{
                if(result.affectedRows==0){
                    return reject(boom.notFound(`Song with id '${id}' was not found`))
                }
                resolve()
            })
            .catch(err=>{reject(boom.boomify(err,{statusCode:500}))})

        })
    }
}