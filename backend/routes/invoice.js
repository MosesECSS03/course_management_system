
var express = require('express');
var router = express.Router();
var PdfGenerator = require('../Others/Pdf/PdfGenerator');

function getCurrentDateTime() {
    const now = new Date();

    // Get day, month, year, hours, and minutes
    const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0'); // 24-hour format
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Ensure two digits
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Ensure two digits

    // Format date and time
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return {
        date: formattedDate,
        time: formattedTime,
    };
}

router.post('/', async function(req, res, next) 
{
    console.log(req.body.details);
    if(req.body.purpose === "generateInvoice")
    {   
        console.log("Generate Invoice");
        var pdf = new PdfGenerator();
        await pdf.generateInvoice(res, req.body.details, req.body.totalPrice, req.body.totalPriceInWords);
        /*var controller = new ReceiptController();
        var result = await controller.newReceiptNo(req.body.courseLocation);
        return res.json({"result": result});*/
    }
});

module.exports = router;

