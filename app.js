/** ================================================================ BUAT WEB SERVER PAKAI EXPRESS DAN DB (MONGO DB) ================================================================ */

const express = require("express");
const { body, validationResult, check } = require("express-validator");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./local_modules/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

/** Set up ejs */
app.set("view engine", "ejs");

/** Middleware untuk Parsing Data Post */
app.use(express.urlencoded({ extended: true }));

/** Konfigurasi Flash */
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

/** Halaman Beranda */
app.get("/", (req, res) => {
  res.render("index");
});

/** Halaman About */
app.get("/about", (req, res) => {
  res.render("about");
});

/** Proses Tambah Data Kontak */
app.post(
  "/save-contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("noHP", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        msg: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        req.flash("msg", "Data contact berhasil ditambahkan!");
        res.redirect("/contacts");
      });
    }
  }
);

/** Proses Ubah Data Kontak */
app.post(
  "/update-contact",
  [
    // res.send(req.body),
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.nama_lama && duplikat) {
        throw new Error("Nama contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("noHP", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("msg", "Data tidak valid");
      res.redirect(`/contact/edit/${req.body.nama_lama}`);
    } else {
      Contact.updateOne(
        { nama: req.body.nama_lama },
        {
          $set: {
            nama: req.body.nama,
            noHP: req.body.noHP,
            email: req.body.email,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data contact berhasil diubah!");
        res.redirect("/contacts");
      });
    }
  }
);

/** Proses Hapus Data Kontak */
app.get("/contact/delete/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    Contact.deleteOne({ _id: contact._id }).then((result) => {
      req.flash("msg", "Kontak berhasil dihapus!");
      res.redirect("/contacts");
    });
  }
});

/** Halaman List Kontak */
app.get("/contacts", async (req, res) => {
  const result = await Contact.find();
  res.render("contacts", { data: result, msg: req.flash("msg") });
});

/** Halaman Menuju Tambah Kontak */
app.get("/contact/add", (req, res) => {
  res.render("add-contact");
});

/** Halaman Menuju Ubah Kontak */
app.get("/contact/edit/:nama", async (req, res) => {
  const result = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", { data: result, msg: req.flash("msg") });
});

/** Halaman Detail Kontak */
app.get("/contact/:nama", async (req, res) => {
  const result = await Contact.findOne({ nama: req.params.nama });
  res.render("detail", { data: result });
});

/** Use -> Middleware -> handle kalo misal urlnya salah, penengah controller, taruh paling bawah */
app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/** ================================================================ BUAT WEB SERVER PAKAI EXPRESS DAN DB (JSON) ================================================================ */

// const express = require("express");
// const contacts = require("./local_modules/contacts");
// const session = require("express-session");
// const cookieParser = require("cookie-parser");
// const flash = require("connect-flash");

// const app = express();
// const port = 3000;

// app.set("view engine", "ejs");

// /** Middleware untuk Parsing Data Post */
// app.use(express.urlencoded({ extended: true }));

// /** Konfigurasi Flash */
// app.use(cookieParser("secret"));
// app.use(
//   session({
//     cookie: { maxAge: 6000 },
//     secret: "secret",
//     resave: true,
//     saveUninitialized: true,
//   })
// );
// app.use(flash());

// /** Halaman Beranda */
// app.get("/", (req, res) => {
//   res.render("index");
// });

// /** Halaman About */
// app.get("/about", (req, res) => {
//   res.render("about");
// });

// /** Proses Tambah Data Kontak */
// app.post("/save-contact", (req, res) => {
//   const msg = contacts.simpanContact(
//     req.body.nama,
//     req.body.email,
//     req.body.noHP
//   );
//   if (msg.status === false) {
//     res.render("add-contact", { msg });
//   } else {
//     req.flash("msg", msg.msg);
//     res.redirect("/contacts");
//   }
// });

// /** Proses Ubah Data Kontak */
// app.post("/update-contact", (req, res) => {
//   const msg = contacts.updateContact(
//     req.body.nama_lama,
//     req.body.nama,
//     req.body.email,
//     req.body.noHP
//   );
//   if (msg.status === false) {
//     // res.send(msg);
//     req.flash("msg", msg.msg);
//     res.redirect(`/contact/edit/${req.body.nama_lama}`);
//   } else {
//     req.flash("msg", msg.msg);
//     res.redirect("/contacts");
//   }
// });

// /** Proses Hapus Data Kontak */
// app.get("/contact/delete/:nama", (req, res) => {
//   const result = contacts.deleteContact(req.params.nama);
//   if (!result) {
//     res.status(404);
//     res.send("<h1>404</h1>");
//   } else {
//     req.flash("msg", "Kontak berhasil dihapus!");
//     res.redirect("/contacts");
//   }
// });

// /** Halaman List Kontak */
// app.get("/contacts", (req, res) => {
//   const result = contacts.loadContact();
//   res.render("contacts", { data: result, msg: req.flash("msg") });
// });

// /** Halaman Menuju Tambah Kontak */
// app.get("/contact/add", (req, res) => {
//   res.render("add-contact");
// });

// /** Halaman Menuju Ubah Kontak */
// app.get("/contact/edit/:nama", (req, res) => {
//   const result = contacts.detailContact(req.params.nama);
//   res.render("edit-contact", { data: result, msg: req.flash("msg") });
// });

// /** Halaman Detail Kontak */
// app.get("/contact/:nama", (req, res) => {
//   const result = contacts.detailContact(req.params.nama);
//   res.render("detail", { data: result });
// });

// /** Use -> Middleware -> handle kalo misal urlnya salah, penengah controller, taruh paling bawah */
// app.use("/", (req, res) => {
//   res.status(404);
//   res.send("<h1>404</h1>");
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

/** ================================================================ BUAT WEB SERVER PAKAI NODE JS ================================================================*/
// const fs = require("fs");
// const http = require("http");
// const port = 3000;

// const renderHTML = (path, res) => {
//   fs.readFile(path, (err, data) => {
//     if (err) {
//       res.writeHead(404);
//       res.write("Error: File not found");
//     } else {
//       res.write(data);
//     }
//     res.end();
//   });
// };

// http
//   .createServer((req, res) => {
//     res.writeHead(200, {
//       "Content-Type": "text/html",
//     });

//     const url = req.url;
//     switch (url) {
//       case "/about":
//         renderHTML("./view/about.html", res);
//         break;
//       case "/contact":
//         renderHTML("./view/contact.html", res);
//         break;
//       default:
//         renderHTML("./view/index.html", res);
//     }
//   })
//   .listen(port, () => {
//     console.log(`Server is listening on port ${port}...`);
//   });
