const express = require("express");
const expressLayout = require("express-ejs-layouts");
const { body, check, validationResult } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayout);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 600 },
    secret: "secret",
    resave: true,
    saveUninitailazed: true,
  })
);
app.use(flash());
app.use(methodOverride("_method"));

require("./utils/db");

const Contact = require("./model/contact");

app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
    title: "Home - Contact App",
  });
});

app.get("/contact", async (req, res) => {
  contacts = await Contact.find();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Contact - Contact App",
    contacts,
    msg: req.flash("msg"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("tambah", {
    layout: "layouts/main-layout",
    title: "Add - Contact App",
  });
});

app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama kontak sudah digunakan");
      }
      return true;
    }),
    check("nohp", "Nomor HP tidak valid").isMobilePhone("id-ID"),
    check("email", "Email tidak valid").isEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("tambah", {
        layout: "layouts/main-layout",
        title: "Add - Contact App",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        req.flash("msg", "Data contact berhasil ditambahakan");
        res.redirect("/contact");
      });
    }
  }
);

app.get("/contact/edit/:id", async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
  });

  res.render("edit", {
    layout: "layouts/main-layout",
    title: "Edit - Contact App",
    contact,
  });
});

app.put(
  "/contact",
  [
    check("nohp", "Nomor HP tidak valid").isMobilePhone("id-ID"),
    check("email", "Email tidak valid").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const contact = await Contact.findOne({ _id: req.body.id });

      res.render("edit", {
        layout: "layouts/main-layout",
        title: "Edit - Contact App",
        errors: errors.array(),
        contact,
      });
    } else {
      Contact.updateOne(
        { _id: req.body.id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data contact berhasil di edit!");
        res.redirect("/contact");
      });
    }
  }
);

app.get("/contact/:id", async (req, res) => {
  // const contact = detailContact(req.params.nama);
  const contact = await Contact.findOne({
    _id: req.params.id,
  });
  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Detail - Contact App",
    contact,
  });
});

app.delete("/contact", (req, res) => {
  Contact.deleteOne({ _id: req.body.id }).then((result) => {
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
  });
});

app.listen(port, () => {
  console.log(`App started at http://localhost:${port}`);
});
