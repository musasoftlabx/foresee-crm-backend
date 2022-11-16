// * Import libraries
const router = require("express").Router();
const ExcelJS = require("exceljs");

// * Handle GET method
router.get("/", async (req, res) => {
  const file = new ExcelJS.Workbook();

  // ? Workbook metadata
  file.creator = "System";
  file.lastModifiedBy = "System";
  file.created = new Date();
  file.modified = new Date();

  // ? Read file
  const workbook = await file.xlsx.readFile("./resources/quotation.xlsx");
  const worksheet = workbook.getWorksheet("Sheet1");

  const details = {
    data: [
      {
        detailWork: "water works and repairs",
        brand: "Brand A",
        quantity: 2,
        unitPrice: 3000,
      },
      {
        detailWork: "tiles installation",
        brand: "Brand B",
        quantity: 1,
        unitPrice: 1200,
      },
      {
        detailWork: "water",
        brand: "Brand C",
        quantity: 3,
        unitPrice: 2500,
      },
    ],
    offer: "Offer X",
    store: "Shop X",
    actioner: "Hellena",
    notes: "Good quality service please",
    VAT: 118,
    issue: "The panel lights are burnt",
    solution: "Replacement",
    warranty: "",
    timeframe: "2 days",
    images: "",
  };

  // ? Update cell values
  worksheet.getCell("D5").value = new Date();
  worksheet.getCell("D6").value = details.offer;
  worksheet.getCell("D7").value = details.store;
  worksheet.getCell("D8").value = details.actioner;
  worksheet.getCell("B9").value = {
    richText: [
      { font: { bold: true }, text: "Notes: " },
      { text: details.notes },
    ],
  };

  let startRow = 16;

  if (details.data.length <= 12) {
    details.data.forEach((detail, i) => {
      i++;
      worksheet.getCell(`B${startRow}`).value = i;
      worksheet.getCell(`C${startRow}`).value = detail.detailWork;
      worksheet.getCell(`H${startRow}`).value = detail.brand;
      worksheet.getCell(`I${startRow}`).value = detail.quantity;
      worksheet.getCell(`J${startRow}`).value = detail.unitPrice;
      worksheet.getCell(`K${startRow}`).value =
        detail.quantity * detail.unitPrice;
      startRow++;
    });
  }

  console.log(worksheet.getCell(`B31`).text);

  worksheet.getCell(`K28`).value = {
    formula: `SUM(K16:K27)`,
    result: 7,
  };
  worksheet.getCell(`K29`).value = { formula: `K28+${details.VAT}`, result: 7 };

  worksheet.getCell("J16:K27").numFmt = "[$KES] #,##0.00";
  worksheet.getCell("K28:K29").numFmt = "[$KES] #,##0.00";

  worksheet.getCell("B31").value = {
    richText: [
      { text: "1 - What is the issue? : " },
      { font: { bold: true }, text: details.issue },
    ],
  };
  worksheet.getCell("B32").value = {
    richText: [
      { text: "2 - What needs to be done? : " },
      { font: { bold: true }, text: details.solution },
    ],
  };
  worksheet.getCell("B33").value = {
    richText: [
      { text: "3 - Warranty : " },
      { font: { bold: true }, text: details.warranty },
    ],
  };
  worksheet.getCell("B34").value = {
    richText: [
      { text: "4 - Timeframe / Deadline : " },
      { font: { bold: true }, text: details.timeframe },
    ],
  };
  worksheet.getCell("B35").value = {
    richText: [
      { text: "5 - Supportive pictures : " },
      { font: { bold: true }, text: details.images },
    ],
  };

  // ? Write to file
  await workbook.xlsx.writeFile("./resources/quotation0.xlsx");

  res.json({
    message: "ok",
  });
});

// Export module to app.js
module.exports = router;
