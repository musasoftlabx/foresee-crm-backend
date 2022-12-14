process.env.TZ = "Africa/Nairobi";
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Import connection
const { express, app } = require("./model/connection");
const verifyToken = require("./middleware/verifyToken");

// Create log file if it doesn't exist
fs.access("./logs/access.log", fs.F_OK, (err) => {
  if (err) {
    fs.mkdir("./logs", { recursive: true }, (err) => {
      if (err) console.log("Error creating logs folder");
      fs.open("./logs/access.log", "w", (err) => {
        if (err) if (err) console.log("Error creating access.log");
      });
    });
  }
});

// Register Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("/public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: fs.createWriteStream("./logs/access.log", {
      flags: "a",
    }),
  })
);

app.use("*/public", express.static("public"));

// Auto-process
app.use("/", (req, res, next) => next());

// Routes
app.use("/login", require("./routes/login"));
app.use("/refresh", require("./routes/refresh"));
app.use("/test", (req, res) => res.json({ msg: "hello" }));
app.use(verifyToken);
app.use("/categories", require("./routes/categories"));
app.use("/tickets", require("./routes/tickets"));
app.use("/quotation", require("./routes/quotation"));
app.use("/upload", require("./routes/upload"));
app.use("/domains", require("./routes/domains"));

app.use("/SendMail", require("./routes/SendMail"));
app.use("/ReadExcel", require("./routes/ReadExcel"));
app.use("/Users", require("./routes/Users"));
app.use("/Stores", require("./routes/Stores"));

// Error management
app.use((req, res) => res.status(404).json({ error: 404 }));
