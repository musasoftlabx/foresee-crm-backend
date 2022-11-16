// Import libraries
const router = require("express").Router();

const _ = require("lodash");

// * Import from schemas
const { ticketsCollection } = require("../model/schema");

// ? Import Error Handler
const ErrorHandler = require("./controllers/ErrorHandler");

// ? Handle GET method
router.get("/", async (req, res) => {
  const tickets = await ticketsCollection.aggregate([
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 1,
        category: 1,
        subcategory: 1,
        details: 1,
        createdAt: 1,
      },
    },
  ]);

  res.json(tickets);
});

// ? Handle POST method
router.post("/:id", async (req, res) => {
  const { _id, subcategory } = req.body;

  ticketsCollection.findOneAndUpdate(
    { _id },
    { $addToSet: { subcategories: subcategory } },
    { new: true },
    (err, data) => {
      if (err) {
        res.status(500).json({});
      }
      res.status(201).json(data);
    }
  );
});

router.post("/", async (req, res) => {
  const { category, subcategory, details } = req.body;

  ticketsCollection.create({ category, subcategory, details }, (err, data) => {
    if (err) {
      res.status(400).json(ErrorHandler(err));
    }
    res.status(201).json(data);
  });
});

// ? Handle DELETE method(s)
router.delete("/:id", async (req, res) => {
  await ticketsCollection.findByIdAndDelete(req.params.id);
  res.json({});
});

router.delete("/:id/:name", async (req, res) => {
  const x = await ticketsCollection.findById(req.params.id);
  x.subcategories.splice(x.subcategories.indexOf(req.params.name), 1);
  const p = await x.save();
  res.json(p);
});

// Export module to app.js
module.exports = router;
