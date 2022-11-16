// Import libraries
const router = require("express").Router();

const _ = require("lodash");

// * Import from schemas
const { categoriesCollection } = require("../model/schema");

// ? Import Error Handler
const ErrorHandler = require("./controllers/ErrorHandler");

// ? Handle GET method
router.get("/", async (req, res) => {
  const categories = await categoriesCollection.aggregate([
    { $sort: { _id: -1 } },
    { $addFields: { subcategory: "" } },
    {
      $project: {
        _id: 1,
        category: 1,
        subcategories: 1,
        createdAt: 1,
        subcategory: 1,
      },
    },
  ]);

  res.json({
    __aT: req.accessToken,
    columns: ["Category", "Operation"],
    rows: categories,
  });
});

// ? Handle POST method
router.post("/:id", async (req, res) => {
  const { _id, subcategory } = req.body;

  categoriesCollection.findOneAndUpdate(
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
  const { category } = req.body;

  const count = await categoriesCollection.countDocuments({ category });

  if (count === 0) {
    categoriesCollection.create(
      { category: _.capitalize(category.toLowerCase()) },
      (err, data) => {
        if (err) {
          res.status(400).json(ErrorHandler(err));
        }
        res.status(201).json({
          _id: data._id,
          category: data.category,
          subcategory: "",
        });
      }
    );
  } else {
    res.status(401).json({
      subject: "Existing",
      body: "This category already exists",
    });
  }
});

// ? Handle DELETE method(s)
router.delete("/:id", async (req, res) => {
  await categoriesCollection.findByIdAndDelete(req.params.id);
  res.json({});
});

router.delete("/:id/:name", async (req, res) => {
  const x = await categoriesCollection.findById(req.params.id);
  x.subcategories.splice(x.subcategories.indexOf(req.params.name), 1);
  const p = await x.save();
  res.json(p);
});

// Export module to app.js
module.exports = router;
