require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const path = require("path")

const User = require("./models/User")
const Note = require("./models/Note")

const app = express()

// ===== MIDDLEWARE =====
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// ===== MULTER SETUP (MUST BE BEFORE ROUTES) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// ===== DB CONNECT =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err))

// ===== TEST =====
app.get("/", (req, res) => {
  res.send("Server is running")
})

// ===== SIGNUP =====
app.post("/signup", async (req, res) => {
  const { email, password } = req.body

  try {
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).send("User already exists")
    }

    const newUser = new User({ email, password })
    await newUser.save()

    res.send("User registered")
  } catch (err) {
    res.status(500).send("Error saving user")
  }
})

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email, password })

    if (user) {
      res.send("Login successful")
    } else {
      res.status(401).send("Invalid credentials")
    }
  } catch (err) {
    res.status(500).send("Error logging in")
  }
})

// ===== ADD NOTE (WITH IMAGE) =====
app.post("/add-note", upload.single("image"), async (req, res) => {
  const { title, content, userEmail } = req.body

  try {
    const newNote = new Note({
      title,
      content,
      userEmail,
      image: req.file ? req.file.filename : null
    })

    await newNote.save()
    res.send("Note added")
  } catch (err) {
    res.status(500).send("Error adding note")
  }
})

// ===== GET NOTES =====
app.get("/notes", async (req, res) => {
  const { email } = req.query

  try {
    const notes = await Note.find({ userEmail: email }).sort({ _id: -1 })
    res.json(notes)
  } catch (err) {
    res.status(500).send("Error fetching notes")
  }
})

// ===== DELETE NOTE =====
app.delete("/delete-note/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id)
    res.send("Note deleted")
  } catch (err) {
    res.status(500).send("Error deleting note")
  }
})

// ===== SERVER =====
app.listen(5000, () => {
  console.log("Server running on port 5000")
})