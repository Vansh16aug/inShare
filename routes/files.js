const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});

let upload = multer({ storage, limits: { fileSize: 1000000 * 100 } }).single(
  "myfile"
); //100mb

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log("ERROR IN THE API! gg");
      return res.status(500).send({ error: err.message });
    }
    if (!req.user) {
      console.log("User not authenticated.");
      // Handle the case where user is not authenticated
      return res.status(401).send({ error: "User not authenticated." });
    }
    console.log("Created by " + req.user);
    console.log("FILE INFO: " + req.file.originalname);
    const file = new File({
      filename: req.file.originalname,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    const fileURL = `${process.env.APP_BASE_URL}/files/${response.uuid}`;
    // Look for the user who created the file and add the file ID to the files_created array
    User.findOne({ _id: req.user.id }, async (err, user) => {
      if (user) {
        console.log("USER FOUND: " + user);
        user.files_created.push({
          filename: response.filename,
          date: new Date(response.createdAt).toDateString(),
          uuid: response.uuid,
        });
        await user.save();
        res.json({ file: fileURL });
      } else {
        req.flash("error_msg", "Error occurred");
      }
    });
  });
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;
  console.log(req.body);
  console.log(`${uuid} ${emailTo} ${emailFrom}`);
  if (!uuid || !emailTo || !emailFrom) {
    return res
      .status(422)
      .send({ error: "All fields are required except expiry." });
  }
  // Get data from db
  try {
    const file = await File.findOne({ uuid: uuid });
    if (!file) {
      return res.status(404).send({ error: "File not found." });
    }

    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require("../services/mailService");
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: "inShare file sharing",
      text: `${emailFrom} shared a file with you.`,
      html: require("../services/emailTemplate")({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + " KB",
        expires: "24 hours",
      }),
    })
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        console.log("ERROR IN EMAIL SENDING!");
        console.log(err);
        return res.status(500).json({ error: "Error in email sending." });
      });
  } catch (err) {
    console.log("SOMETHING WENT WRONOG!!");
    console.log(err);
    return res.status(500).send({ error: "Something went wrong." });
  }
});

module.exports = router;
