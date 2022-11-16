// Import libraries
const router = require("express").Router();

const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const _ = require("lodash");
const randomstring = require("randomstring");

// * Import from schemas
const { usersCollection } = require("../model/schema");

// ? Import Error Handler
const ErrorHandler = require("./controllers/ErrorHandler");

// ? Handle GET method
router.get("/", async (req, res) => {
  console.log(req.cookies);

  const users = await usersCollection.aggregate([
    { $sort: { _id: -1 } },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        username: 1,
        emailAddress: 1,
        domain: 1,
        createdAt: 1,
        convertedDate: 1,
      },
    },
  ]);

  res.json({
    columns: [
      "First Name",
      "Last Name",
      "Username",
      "Email Address",
      "Domain",
      "Created At",
      "Operations",
    ],
    rows: users.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddress: user.emailAddress,
      domain: user.domain,
      createdAt: dayjs(user.createdAt).format(
        "ddd, DD.MMM.YYYY [at] hh.mm.ss a"
      ),
    })),
  });
});

// ? Handle POST method
router.post("/", async (req, res) => {
  const { firstName, lastName, emailAddress, domain } = req.body;

  let username = `${firstName.charAt(0)}${lastName}`;

  const passkey = firstName; // randomstring.generate(8);

  const password = await bcrypt.hash(passkey, 10);

  let count = await usersCollection.countDocuments({ username });

  if (count === 0) {
    usersCollection.create(
      {
        firstName: _.capitalize(firstName.toLowerCase()),
        lastName: _.capitalize(lastName.toLowerCase()),
        emailAddress: emailAddress.toLowerCase(),
        username: username.toLowerCase(),
        password,
        domain,
      },
      (err, data) => {
        if (err) {
          res.status(400).json(ErrorHandler(err));
        } else {
          res.status(201).json({
            _id: data._id,
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            emailAddress: data.emailAddress,
            domain: data.domain,
            createdAt: dayjs(data.createdAt).format(
              "ddd, DD.MMM.YY [at] hh.mm.ss a"
            ),
          });
        }
      }
    );
  } else {
    res.status(401).json({
      subject: "Existing",
      body: "This username already exists",
    });
  }
});

// ? Handle DELETE method
router.delete("/:id", async (req, res) => {
  await usersCollection.findByIdAndDelete(req.params.id);
  res.json({});
});

// Export module to app.js
module.exports = router;
