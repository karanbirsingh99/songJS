drop database if exists songjs;
create database songjs;
use songjs;
set default_storage_engine=innodb;
create table Artist(
    ArtistID int unsigned primary key auto_increment,
    artistName varchar(255) not null
);
create table Album(
    AlbumID int unsigned primary key auto_increment,
        albumName varchar(255) not null,
        ArtistID int unsigned not null,
        foreign key(ArtistID) references Artist(ArtistID)
);
create table Song(
    SongID int unsigned primary key auto_increment,
    Name varchar(255) not null,
    Date date,
    Plays int unsigned not null default 0,
    Length int unsigned,
    AlbumID int unsigned,
    ArtistID int unsigned not null,
    dateAdded timestamp not null default current_timestamp,
    trackNumber int unsigned,
    foreign key (AlbumID) references Album(AlbumID),
    foreign key (ArtistID) references Artist(ArtistID)
);
create table User(
    UserID int unsigned primary key auto_increment,
    Username varchar(255) unique not null,
    Email varchar(255) unique not null,
    firstName varchar(255) not null,
    lastName varchar(255),
    joinDate timestamp not null default current_timestamp,
    Password varchar(255) not null,
    Salt varchar(255)
);
create table Playlist(
    PlaylistID int unsigned primary key auto_increment,
    UserID int unsigned not null,
    Title varchar(255) not null,
    Description text,
    isPublic boolean not null,
    lastUpdated timestamp not null default current_timestamp on update current_timestamp,
    dateCreated timestamp not null default current_timestamp,
    foreign key (UserID) references User(UserID) on delete cascade
);
create table Playlist_Song(
    PlaylistID int unsigned,
    SongID int unsigned,
    Plays int unsigned not null default 0,
    Song_order int unsigned,
    primary key(PlaylistID,SongID),
    unique key(PlaylistID,Song_Order),
    foreign key(PlaylistID) references Playlist(PlaylistID) on delete cascade,
    foreign key(SongID) references Song(SongID) on delete cascade
);
create table Followed(
    UserID int unsigned,
    ArtistID int unsigned,
    primary key (UserID,ArtistID),
    foreign key (UserID) references User(UserID) on delete cascade,
    foreign key (ArtistID) references Artist(ArtistID) on delete cascade
);
create table Favorite(
    UserID int unsigned,
    SongID int unsigned,
    primary key(UserID,SongID),
    foreign key (UserID) references User(UserID) on delete cascade,
    foreign key (SongID) references Song(SongID) on delete cascade
);

create trigger mustHaveChildren after delete on song for each row 
    begin
        delete from album where
            not exists(select * from (select * from album where albumid=old.albumid) as t join song using (albumid)) 
            and 
            albumid=old.albumid;
        delete from artist where
            not exists(select * from (select * from artist where artistid=old.artistid) as t join song using (artistid))
            and
            artistid=old.artistid;
    end

