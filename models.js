const mongoose = require("mongoose");
const userchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  messages: [
    {
      type: String,
    },
  ],
});

module.exports = new mongoose.model("user", userchema);
