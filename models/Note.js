const mongoose = require("mongoose")
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userEmail: String,
  createdAt: { type: Date, default: Date.now },
  image: String

})
module.exports = mongoose.model("Note", noteSchema)