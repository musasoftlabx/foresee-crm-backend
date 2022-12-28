// * Import libraries
const router = require("express").Router();
const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
const fs = require("fs").promises;
const libre = require("libreoffice-convert");
libre.convertAsync = require("util").promisify(libre.convert);

// * Import from schemas
const { constantsCollection, ticketsCollection } = require("../model/schema");

// * Import Error Handler
const ErrorHandler = require("./controllers/ErrorHandler");

// * Create constants
router.get("/", async (req, res) => {
  /* constantsCollection.create({ application: { VAT: 0.16 } });
  res.sendStatus(201); */
  const { quotation } = await ticketsCollection.findById(
    "638da6f71a13fdd43cd9dc2a"
  );
  res.json(JSON.stringify(quotation) === "{}");
});

// * Generate quotation and write to excel file
router.post("/", async (req, res) => {
  const {
    _,
    offerDate,
    issue,
    solution,
    warranty,
    timeframe,
    notes,
    workDetails,
  } = req.body;

  // ? Check if quote doesn't exists
  const {
    quotation,
    quotation: { approved, mailed, revisions, total, ...rest },
  } = await ticketsCollection.findById(_);

  if (quotation.offerNo) {
    await ticketsCollection.findByIdAndUpdate(_, {
      $push: { "quotation.revisions": rest },
    });
  }

  // ? Update ticket with quotation details
  ticketsCollection.findByIdAndUpdate(
    _,
    {
      $set: {
        "quotation.offerDate": offerDate,
        "quotation.offerNo": _,
        "quotation.issue": issue,
        "quotation.solution": solution,
        "quotation.warranty": warranty,
        "quotation.timeframe": timeframe,
        "quotation.notes": notes,
        "quotation.workDetails": workDetails,
        "quotation.VAT": 0,
      },
      /* quotation: {
        offerDate,
        offerNo: _,
        issue,
        solution,
        warranty,
        timeframe,
        notes,
        workDetails
      }, */
    },
    async (err, data) => {
      if (err) return res.status(400).json(ErrorHandler(err));

      const file = new ExcelJS.Workbook();

      // ? Workbook metadata
      file.creator = "System";
      file.lastModifiedBy = "System";
      file.created = new Date();
      file.modified = new Date();

      // ? Read file
      const workbook = await file.xlsx.readFile(
        "./public/templates/quotation.xlsx"
      );
      const worksheet = workbook.getWorksheet("Sheet1");

      // ? Update cell values
      worksheet.getCell("D5").value = dayjs(offerDate).format(
        "ddd, DD MMM YYYY [at] hh:mm:ss a"
      );
      worksheet.getCell("D6").value = _;
      worksheet.getCell("D7").value = data.forStore;
      worksheet.getCell("D8").value = req.actioner;
      worksheet.getCell("B9").value = {
        richText: [{ font: { bold: true }, text: "Notes: " }, { text: notes }],
      };

      let startRow = 16;

      if (workDetails.length <= 12) {
        workDetails.forEach((detail, i) => {
          i++;
          worksheet.getCell(`B${startRow}`).value = i;
          worksheet.getCell(`C${startRow}`).value = detail.work;
          worksheet.getCell(`H${startRow}`).value = detail.brand;
          worksheet.getCell(`I${startRow}`).value = detail.quantity;
          worksheet.getCell(`J${startRow}`).value = detail.price;
          worksheet.getCell(`K${startRow}`).value =
            detail.quantity * detail.price;
          startRow++;
        });
      }

      worksheet.getCell(`K28`).value = {
        formula: `SUM(K16:K27)`,
        result: 7,
      };
      worksheet.getCell(`K29`).value = {
        formula: `K28+${(await constantsCollection.find({})).VAT}`,
        result: 7,
      };

      worksheet.getCell("J16:K27").numFmt = "[$KES] #,##0.00";
      worksheet.getCell("K28:K29").numFmt = "[$KES] #,##0.00";

      worksheet.getCell("B31").value = {
        richText: [
          { text: "1 - What is the issue? : " },
          { font: { bold: true }, text: issue },
        ],
      };
      worksheet.getCell("B32").value = {
        richText: [
          { text: "2 - What needs to be done? : " },
          { font: { bold: true }, text: solution },
        ],
      };
      worksheet.getCell("B33").value = {
        richText: [
          { text: "3 - Warranty : " },
          { font: { bold: true }, text: warranty },
        ],
      };
      worksheet.getCell("B34").value = {
        richText: [
          { text: "4 - Timeframe / Deadline : " },
          { font: { bold: true }, text: timeframe },
        ],
      };
      worksheet.getCell("B35").value = {
        richText: [
          { text: "5 - Supportive pictures : " },
          { font: { bold: true }, text: "" },
        ],
      };

      const xlsx = `./public/quotations/Q${_}.xlsx`;
      const pdf = `./public/quotations/Q${_}.pdf`;
      const url = `${process.env.HOST}${pdf.replace("./", "")}`;

      // ? Write excel to file
      await workbook.xlsx.writeFile(xlsx);

      // ? Convert to PDF. Ensure LibreOffice is installed in machine
      await fs.writeFile(
        pdf,
        await libre.convertAsync(await fs.readFile(xlsx), ".pdf", undefined)
      );

      // ? Delete excel file
      await fs.unlink(xlsx);

      // ? Update DB to include URL
      await ticketsCollection.findByIdAndUpdate(_, {
        $set: { "quotation.url": url },
      });

      res.json({ url });
    }
  );
});

// * Update DB and send mail
router.put("/", async (req, res) => {
  const nodemailer = require("nodemailer");

  const { _ } = req.body;

  let transporter = nodemailer.createTransport({
    host: "mail.nairochem.com", //mail.privateemail.com for namecheap
    port: 465,
    secure: true,
    auth: {
      user: "repairs@nairochem.com", // admin@imsysafrica.com
      pass: "@Nairo2022#", // Jireh@2022
    },
  });

  try {
    let info = await transporter.sendMail({
      from: '"Test Nairochem 👻" <repairs@nairochem.com>',
      //to: "musasoftlabx@gmail.com, brian@nairochem.com, hellena@nairochem.com, jane@nairochem.com", // list of receivers //,
      to: "musasoftlabx@gmail.com", // list of receivers //,
      subject: "Hello there",
      text: "Testing the automated system mai",
      html: "<b>Testing the automated system mail</b>",
      attachments: [
        {
          filename: "Quotation.pdf",
          path: `./public/quotations/Q637b98c03d5697867fba9c56.pdf`, // stream this file
        },
      ],
    });

    await ticketsCollection.findByIdAndUpdate(_, {
      $set: { "quotation.mailed": true },
    });

    console.log("Message sent: %s", info.messageId);

    res.json({
      message: info.messageId,
    });
  } catch (err) {
    res.status(500).json(ErrorHandler(err));
  }
});

// Export module to app.js
module.exports = router;
