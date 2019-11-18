const pool = require('../../initialization/database')
const boom = require('@hapi/boom')
const joi = require('@hapi/joi')


const playlistSchema = joi.object({

    title: joi.string()
       .max(255),

    description: joi.string()
        .max(65535)
        .optional(),

    ispublic: joi.boolean(),

    userid: joi.number()

})



module.exports = {

    ownsPlaylist(userid,playlistid){
        return new Promise((resolve,reject)=>{
            pool.query("select userid from playlist where playlistid=?",[playlistid])
            .then(([result,fields])=>{
                if(result.length==0){
                    return reject(boom.notFound(`Playlist with id '${playlistid}' was not found`))
                }
                if(result[0].userid==userid){
                    return resolve(true)
                }
                resolve(false)
            })
            .catch(reject)
        })    

    },
    getPlaylist(playlistid){
        return new Promise((resolve,reject)=>{
            pool.query(`select json_object(
                'playlistid',playlistid,
                'title',title,
                'description',description,
                'ispublic',ispublic,
                'lastupdated',lastupdated,
                'datecreated',datecreated,
                'user',json_object(
                    'userid',user.userid,
                    'username',username,
                    'fullname',concat(firstname,coalesce(concat(' ',lastname),''))
                    ),
                'songs',(
                    select json_arrayagg(
                        json_object(
                            'name',name,
                            'songid',song.songid,
                            'length',length,
                            'position',song_order,
                            'artistname',artistname,
                            'artistid',artist.artistid,
                            'albumid',album.albumid,
                            'albumname',albumname
                            )
                    ) from playlist_song join song on playlist_song.playlistid = ? and playlist_song.songid=song.songid join artist on song.artistid=artist.artistid left join album on song.albumid=album.albumid
                )
            ) as result
            from playlist join user on playlist.userid=user.userid and playlistid=?;`,[playlistid,playlistid])
            .then(([row,fields])=>{
                if(row.length==0){
                    return reject(boom.notFound(`Playlist with id '${playlistid}' was not found`))
                }
                let result = row[0].result
                if(!result.songs) return resolve(result)
                let ar_sorted = []
                result.songs.forEach((el)=>{
                    ar_sorted[el.position]=el
                })
                result.songs=ar_sorted
                resolve(result)
            })
            .catch(reject)
        })
    },
    getUserPlaylists(userid){
        return new Promise((resolve,reject)=>{
            pool.query(`select coalesce(
                    json_arrayagg(
                        json_object(
                        'playlistid',playlistid,
                        'title',title,
                        'description',description,
                        'ispublic',ispublic,
                        'lastupdated',lastupdated,
                        'datecreated',datecreated,
                        'user',json_object(
                            'userid',user.userid,
                            'username',username,
                            'fullname',concat(firstname,coalesce(concat(' ',lastname),''))
                        )
                    )
            ),json_array()) as result from playlist join user on playlist.userid=user.userid and playlist.userid = ?`,[userid])
            .then(([row,fields])=>{
                return resolve(row[0].result)
            })
            .catch(reject)
        })
    },
    getPublicPlaylists(){
        return new Promise((resolve,reject)=>{
            pool.query(`select coalesce(
                    json_arrayagg(
                        json_object(
                        'playlistid',playlistid,
                        'title',title,
                        'description',description,
                        'lastupdated',lastupdated,
                        'datecreated',datecreated,
                        'user',json_object(
                            'userid',user.userid,
                            'username',username,
                            'fullname',concat(firstname,coalesce(concat(' ',lastname),''))
                        )
                    )
            ),json_array()) as result from playlist join user on playlist.userid=user.userid and playlist.ispublic = 1`)
            .then(([row,fields])=>{
                return resolve(row[0].result)
            })
            .catch(reject)
        })
    },
    deletePlaylist(playlistid){
        return new Promise((resolve,reject)=>{
            
            pool.query("delete from playlist where playlistid=?",[playlistid])
            .then(([result,fields])=>{
                if(result.affectedRows==0){
                    return reject(boom.notFound(`Playlist with id '${playlistid}' was not found`))
                }
                resolve()
            })
            .catch(reject)
        })    
    },
    createPlaylist(playlist){
        return new Promise((resolve,reject)=>{
            playlistSchema.validateAsync(playlist,{presence:'required'})
            .catch(err=>{
                return reject(boom.boomify(err,{statusCode:400}))
            })
            .then((playlist)=>{
                return pool.query("insert into playlist (userid,title,description,ispublic) values (?,?,?,?)",[playlist.userid,playlist.title,playlist.description,playlist.ispublic])
            })
            .then(([result,fields])=>{
                return resolve(playlist)
            })
            .catch(reject)

        })

    },
    updatePlaylist(playlist,playlistid){
        return new Promise((resolve,reject)=>{
            playlistSchema.min(1).validateAsync(playlist,{presence:'optional'})
            .catch(err=>{
                return reject(boom.boomify(err,{statusCode:400}))
            })
            .then(playlist=>{
                //should be factored out later
                function sqlUpdate(playlist){
                    var keys = Object.keys(playlist)
                    objectArray = keys.map(k=>{return{[k]:playlist[k]}})
                    objectArray.push(playlistid)
                    return pool.query("update playlist set "+"?,".repeat(keys.length-1)+"? where playlistid=?",objectArray)
                }
                return sqlUpdate(playlist)
            })
            .then(([result,fields])=>{
                if(result.affectedRows==0){
                    return reject(boom.notFound("Invalid PlaylistID"))
                }
                resolve(playlist)
            })
            .catch(reject)

        })
    }

}
