/** import file system (file handling) dan readline (IO) from core module */
const fs = require("fs");
const chalk = require("chalk");
const validator = require("validator");
/** hidupin kalo mau input dari console */
// const { rejects } = require("assert");
// const { resolve } = require("path");

/** hidupin kalo mau input dari console */
// const readline = require("readline");

/** siapin interface untuk readline (set input dan output interface) */
/** hidupin kalo mau input dari console */
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

/** membuat folder data bila belum ada */
const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

/** membuat file contacts.json bila belum ada */
const dataPath = "./data/contacts.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

/** bikin fungsi untuk tulis pertanyaan (daripada pakai callback, nanti malah jadi callback hell / semakin menjorok ke dalam) */
/** hidupin kalo mau input dari console */
// const tulisPertanyaan = (pertanyaan) => {
//   return new Promise((resolve, reject) => {
//     rl.question(pertanyaan, (jawaban) => {
//       resolve(jawaban);
//     });
//   });
// };

const loadContact = () => {
  /** baca isi json */
  const file = fs.readFileSync("data/contacts.json", "utf-8");

  /** ubah isi json menjadi array */
  const contacts = JSON.parse(file);

  return contacts;
};

/** bikin fungsi simpanContact untuk handle insert json yg dipanggil di app.js */
const simpanContact = (nama, email, noHP) => {
  /** bikin objek contact */
  const contact = { nama, email, noHP };

  /** load contact */
  const contacts = loadContact();

  /** cek duplikat */
  const duplikat = contacts.find((contact) => contact.nama === nama);
  if (duplikat) {
    return {
      status: false,
      msg: "Contact sudah terdaftar, gunakan nama lain!",
    };
  }

  /** cek email */
  if (email) {
    if (!validator.isEmail(email)) {
      return { status: false, msg: "Email tidak valid!" };
    }
  }

  /** cek no HP */
  if (!validator.isMobilePhone(noHP, "id-ID")) {
    return { status: false, msg: "Nomor HP tidak valid!" };
  }

  /** push ke array */
  contacts.push(contact);

  /** overwrite json dengan yg terbaru */
  fs.writeFileSync("data/contacts.json", JSON.stringify(contacts));

  return { status: true, msg: "Terima kasih sudah memasukkan data Anda!" };

  /** hidupin kalo mau input dari console */
  // rl.close();
};

const listContact = () => {
  const contacts = loadContact();
  console.log(chalk.cyan.inverse.bold("Daftar Kontak:"));
  contacts.forEach((contact, i) => {
    console.log(`${i + 1}. ${contact.nama} - ${contact.noHP}`);
  });
};

const detailContact = (nama) => {
  const contacts = loadContact();
  const contact = contacts.find(
    (contact) => contact.nama.toLowerCase() === nama.toLowerCase()
  );

  if (!contact) {
    return false;
  }

  return contact;
};

const deleteContact = (nama) => {
  const contacts = loadContact();
  const newContacts = contacts.filter(
    (contact) => contact.nama.toLowerCase() !== nama.toLowerCase()
  );

  if (contacts.length === newContacts.length) {
    return false;
  }

  fs.writeFileSync("data/contacts.json", JSON.stringify(newContacts));

  return true;
};

const updateContact = (nama_lama, nama, email, noHP) => {
  /** bikin objek contact */
  const contact = { nama, email, noHP };

  /** load contact */
  const contacts = loadContact();

  /** cek ada/tidak data lama dan ada tidaknya duplikat */
  const dataLama = contacts.find((contact) => contact.nama === nama_lama);
  const duplikat = contacts.find((contact) => contact.nama === nama);
  if (dataLama) {
    if (!duplikat) {
      /** tampung isi json lama tanpa data lama */
      const newContacts = contacts.filter(
        (contact) => contact.nama.toLowerCase() !== nama_lama.toLowerCase()
      );

      /** cek email */
      if (email) {
        if (!validator.isEmail(email)) {
          return { status: false, msg: "Email tidak valid!" };
        }
      }

      /** cek no HP */
      if (!validator.isMobilePhone(noHP, "id-ID")) {
        return { status: false, msg: "Nomor HP tidak valid!" };
      }

      /** delete data lama */
      deleteContact(nama_lama);

      /** push ke array */
      newContacts.push(contact);

      /** overwrite json dengan yg terbaru */
      fs.writeFileSync("data/contacts.json", JSON.stringify(newContacts));

      return { status: true, msg: "Data berhasil di ubah!" };
    } else {
      return {
        status: false,
        msg: "Nama Kontak Sudah Digunakan!",
      };
    }
  } else {
    return {
      status: false,
      msg: "Contact tidak ditemukan!",
    };
  }
};

/** hapus tulis pertanyaan kalau ga lagi pake input console */
// module.exports = { tulisPertanyaan, simpanContact };

module.exports = {
  simpanContact,
  listContact,
  detailContact,
  deleteContact,
  loadContact,
  updateContact,
};
