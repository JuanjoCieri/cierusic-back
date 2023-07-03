import { db, storage } from "../../firebase.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export const getLikedUserSongs = async (req, res) => {
  try {
    const { id } = req.params
    if (id) {
      const user = await db.collection("users").doc(id).get();
      const userData = user.data();

      const likedSongs = [];

      for (let like of Object.values(userData.likes)) {
        const song = await db.collection("songs").doc(like).get();
        const songData = song.data();
        const songWithId = { id: song.id, ...songData };
        likedSongs.push(songWithId);
      }

      console.log(likedSongs, "aca")

      res.status(200).json(likedSongs);
    } else {
      res.status(401).json({ message: "Token not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting liked songs" });
  }
};

export const getUserSongs = async (req, res) => {
  try {
    const {id} = req.params
    if (id) {
      const user = await db.collection("users").doc(id).get();
      const userData = user.data();

      const userSongs = [];

      for (let songg of Object.values(userData.songs)) {
        const song = await db.collection("songs").doc(songg).get();
        const songData = song.data();
        const songWithId = { id: song.id, ...songData };
        userSongs.push(songWithId);
      }

      res.status(200).json(userSongs);
    } else {
      res.status(401).json({ message: "Token not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting user songs" });
  }
};

export const postSong = async (req, res) => {
  const { name, image, artist, desc, artistId } = req.body;
  const likes = [];
  const comments = [];
  const file = req.file;
  const tiempoTranscurrido = Date.now();
  const hoy = new Date(tiempoTranscurrido);

  try {
    const fileRef = storage.bucket().file(file.filename);
    const writeStream = fileRef.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    writeStream.on("error", (err) => {
      console.error(err);
      res.status(500).send("Error al subir la canción.");
    });

    writeStream.on("finish", async () => {
      const downloadUrl = await fileRef.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });

      const songRef = db.collection("songs").doc();
      const songId = await songRef.set({
        name,
        image: image ? image : "",
        artist: [artist, artistId],
        date: hoy,
        likes,
        comments,
        desc: desc ? desc : "Sin descripción",
        fileUrl: downloadUrl,
      });

    //   const userRef = db.collection("users").doc(artistId);
    // const userDoc = await userRef.get();

    // const userSongs = userDoc.data().songs || [];
    // userSongs.push(songId);

    // await userRef.update({ songs: userPlaylists });

      // const userRef = db.collection("users").doc(artistId);
      // await userRef.update({
      //   songs: admin.firestore.FieldValue.arrayUnion(songRef.id)
      // });

      res.send("Canción subida exitosamente.");
    });

    writeStream.end(fs.readFileSync(file.path));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al subir la canción.");
  }
};

export const postLikeSong = async (req, res) => {
  const { userId, songId } = req.body;
  try {
    const songRef = db.collection("songs").doc(songId);
    const songDoc = await songRef.get();
    const likes = songDoc.data().likes || [];

    const userIdIndex = likes.indexOf(userId);

    if (userIdIndex !== -1) {
      likes.splice(userIdIndex, 1);
    } else {
      likes.push(userId);
    }

    await songRef.update({ likes });

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const userLikes = userDoc.data().likes || [];
    if (userIdIndex !== -1) {
      userLikes.splice(userIdIndex, 1);
    } else {
      userLikes.push(songId);
    }

    await userRef.update({ likes: userLikes });

    res.send("Like posted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error posting a like a to the song.");
  }
};

export const getPlaylistDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const playlistRef = db.collection("playlisttop").doc(id);
    const playlistDoc = await playlistRef.get();

    if (!playlistDoc.exists) {
      res.status(404).send("Playlist not found");
      return;
    }

    const playlistData = playlistDoc.data();

    res.status(200).json(playlistData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving playlist");
  }
};

export const getPlaylistSongs = async (req, res) => {
  const playlistId = req.params.id;
  try {
    const playlistDoc = await db
      .collection("playlisttop")
      .doc(playlistId)
      .get();
    if (!playlistDoc.exists) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const songIds = playlistDoc.data().songs;

    const songs = [];
    for (const { songId } of songIds) {
      const songDoc = await db.collection("songs").doc(songId).get();
      if (songDoc.exists) {
        const songData = songDoc.data();
        const songWithId = { id: songId, ...songData };
        songs.push(songWithId);
      }
    }

    res.status(200).json({ songs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting playlist songs" });
  }
};

export const postCommentSong = async (req, res) => {
  let { songId, userId, comment, userName, userImage } = req.body;
  const tiempoTranscurrido = Date.now();
  const hoy = new Date(tiempoTranscurrido);
  try {
    const songRef = db.collection("songs").doc(songId);
    const song = await songRef.get();
    const comments = song.data().comments;
    comments.push({
      date: hoy,
      userId: userId,
      comment: comment,
      userName: userName,
      userImage: userImage,
    });
    await songRef.update({ comments: comments });
    res.status(200).send("Comment added successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding comment");
  }
};

export const getSongById = async (req, res) => {
  const songId = req.params.id;

  try {
    const song = await db.collection("songs").doc(songId).get();

    if (!song.exists) {
      return res.status(404).json({ message: "Song not found" });
    }

    const songData = song.data();

    res.status(200).json({ id: song.id, ...songData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting song" });
  }
};
