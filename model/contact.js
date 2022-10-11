const mongoose = require("mongoose");

const Contact = mongoose.model("Contact", {
  nama: {
    type: String,
    required: true,
  },
  nohp: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = Contact;
