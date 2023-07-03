import { db } from "../../firebase.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

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
    playlistData.id = playlistDoc.id;

    res.status(200).json(playlistData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving playlist");
  }
};

export const getForYouPlaylist = async (req, res) => {
  try {
    const playlistsSnapshot = await db
      .collection("playlisttop")
      .where("forYou", "==", true)
      .get();

    const playlists = [];
    playlistsSnapshot.forEach((doc) => {
      const playlist = doc.data();
      playlist.id = doc.id;
      playlists.push(playlist);
    });

    res.status(200).json(playlists);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting playlists" });
  }
};

export const postCreatePlaylist = async (req, res) => {
  let { userId, userName, name, image, desc } = req.body;
  const time = Date.now();
  const now = new Date(time);
  try {
    const newPlaylist = await db.collection("playlisttop").add({
      author: [userName, userId],
      name: name ? name : "Nueva playlist",
      image: image
        ? image
        : "https://res.cloudinary.com/dqdmm93bn/image/upload/c_scale,h_600,w_600/v1683640564/cool-background_fw0vzr.png",
      desc: desc ? desc : "",
      songs: [],
      likes: [],
      comments: [],
      date: now,
      tags: [],
      forYou: false,
    });

    const playlistId = newPlaylist.id;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const userPlaylists = userDoc.data().playlist || [];
    userPlaylists.push(playlistId);

    await userRef.update({ playlist: userPlaylists });

    res.status(200).send("Playlist created successfully!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating playlist.");
  }
};

export const postAddSongToPlaylist = async (req, res) => {
  const { userId, playlistId, songId } = req.body;
  const time = Date.now();
  const now = new Date(time);
  try {
    const playlistRef = db.collection("playlisttop").doc(playlistId);
    const playlistDoc = await playlistRef.get();
    if (!playlistDoc.exists) {
      return res.status(404).send("Playlist not found");
    }
    const playlistData = playlistDoc.data();
    if (playlistData.author[1] !== userId) {
      return res.status(401).send("Unauthorized");
    }

    const songRef = db.collection("songs").doc(songId);
    const songDoc = await songRef.get();
    if (!songDoc.exists) {
      return res.status(404).send("Song not found");
    }
    const songData = songDoc.data();
    if (playlistData.songs.includes(songId)) {
      return res.status(400).send("Song already in playlist");
    }

    await playlistRef.update({
      songs: [
        ...playlistData.songs,
        {
          songId: songId,
          date: now,
        },
      ],
    });

    return res.status(200).send("Song added to playlist");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postLikePlaylist = async (req, res) => {
  const { userId, playlistId } = req.body;

  try {
    const playlistRef = db.collection("playlisttop").doc(playlistId);
    const playlistDoc = await playlistRef.get();
    const likes = playlistDoc.data().likes || [];

    const userIdIndex = likes.indexOf(userId);

    if (userIdIndex !== -1) {
      likes.splice(userIdIndex, 1);
    } else {
      likes.push(userId);
    }

    await playlistRef.update({ likes });

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const userLikes = userDoc.data().likedPlaylist || [];
    const playlistIndex = userLikes.indexOf(playlistId);

    if (playlistIndex !== -1) {
      userLikes.splice(playlistIndex, 1);
    } else {
      userLikes.push(playlistId);
    }

    await userRef.update({ likedPlaylist: userLikes });

    res.send("Like posted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error posting a like to the playlist.");
  }
};

export const postCommentPlaylist = async (req, res) => {
  let { playlistId, userId, comment, userName, userImage } = req.body;

  const tiempoTranscurrido = Date.now();
  const hoy = new Date(tiempoTranscurrido);
  try {
    const playlistRef = db.collection("playlisttop").doc(playlistId);
    const playlist = await playlistRef.get();
    const comments = playlist.data().comments;
    comments.push({
      date: hoy,
      userId: userId,
      comment: comment,
      userName: userName,
      userImage: userImage,
    });
    await playlistRef.update({ comments: comments });
    res.status(200).send("Comment added successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding comment");
  }
};

export const getLikedUserPlaylists = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (token) {
      const decodedToken = jwt.decode(token);
      const userId = decodedToken.id;
      const user = await db.collection("users").doc(userId).get();
      const userData = user.data();
      console.log(userData)

      const likedPlaylists = [];
      const playlistIds = [...userData.likedPlaylist, ...userData.playlist];

      for (let playlistId of playlistIds) {
        const playlist = await db
          .collection("playlisttop")
          .doc(playlistId)
          .get();
        const playlistData = playlist.data();
        likedPlaylists.push({ ...playlistData, id: playlist.id });
      }
      res.status(200).json(likedPlaylists);
    } else {
      res.status(401).json({ message: "Token not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting liked playlists" });
  }
};
