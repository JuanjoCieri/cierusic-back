import { db } from "../../firebase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export const getLoggedUser = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (token) {
      const decodedToken = jwt.decode(token);
      const userId = decodedToken.id;
      const loggedUser = await db.collection("users").doc(userId).get();
      const userData = loggedUser.data();
      res.status(200).json({ id: userId, ...userData });
    } else {
      res.status(401).json({ message: "Token not found" });
    }
  } catch (error) {
    res.send(error);
  }
};

export const postUserRegister = async (req, res) => {
  const { name, email, password, city, desc, image } = req.body;
  const tiempoTranscurrido = Date.now();
  const hoy = new Date(tiempoTranscurrido);
  const user = db.collection("users");
  const doc = await user.where("email", "==", email).get();
  if (!name || !email || !password) {
    res.status(400).send("Missing data");
  }
  if (!doc.empty) {
    res.status(400).send("Email registered");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserRef = await db.collection("users").add({
        name,
        email,
        password: hashedPassword,
        city: city ? city : "Unknown",
        desc: desc ? desc : "The user does not provide information",
        image: image
          ? image
          : "https://icones.pro/wp-content/uploads/2021/02/icone-utilisateur-gris.png",
        likes: [],
        playlist: [],
        likedPlaylist: [],
        songs: [],
        date: hoy,
      });
      res.status(200).send("User created successfully");
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  }
};

export const postUserLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.collection("users");
    const doc = await user.where("email", "==", email).get();
    if (doc.empty) {
      res.status(400).json({ error: "User does not exist" });
    } else {
      const firstDoc = doc.docs[0];
      const match = await bcrypt.compare(password, firstDoc.data().password);
      if (match) {
        const userId = firstDoc.id;
        const token = jwt.sign({ id: userId }, process.env.JWT_KEY);
        res.cookie("session", token, {
          expires: new Date(Date.now() + 9999999),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.cookie("res_sess", "1", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.status(200).json({ user, token });
      } else {
        res.status(400).json({ error: "Incorrect password" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const postUserLogout = async (req, res) => {
  try {
    res.clearCookie("session");
    res.cookie("res_sess", "0");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.send(error);
  }
};

export const getUserDetail = async (req, res) => {
  const id = req.params.id;
  try {
    const userDetail = await db.collection("users").doc(id).get();
    const userData = userDetail.data();
    res.status(200).json({ id: id, ...userData });
  } catch (error) {
    console.log(error);
  }
};

export const searchByName = async (req, res) => {
  const namee = req.query.name;

  const name = namee.charAt(0).toUpperCase() + namee.slice(1).toLowerCase();

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("name", ">=", name)
      .where("name", "<=", name + "\uf8ff")
      .get();

    const songsSnapshot = await db
      .collection("songs")
      .where("name", ">=", name)
      .where("name", "<=", name + "\uf8ff")
      .get();

    const playlistTopSnapshot = await db
      .collection("playlisttop")
      .where("name", ">=", name)
      .where("name", "<=", name + "\uf8ff")
      .get();

    const searchResults = {
      users: [],
      songs: [],
      playlistTop: [],
    };

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      searchResults.users.push({ id: doc.id, ...userData });
    });

    songsSnapshot.forEach((doc) => {
      const songData = doc.data();
      searchResults.songs.push({ id: doc.id, ...songData });
    });

    playlistTopSnapshot.forEach((doc) => {
      const playlistData = doc.data();
      searchResults.playlistTop.push({ id: doc.id, ...playlistData });
    });

    res.status(200).json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching by name" });
  }
};
