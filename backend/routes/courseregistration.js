var express = require('express');
var router = express.Router();
var RegistrationController = require('../Controller/Registration/RegistrationController');
var ReceiptController = require('../Controller/Receipt/ReceiptController');
var PdfGenerator = require('../Others/Pdf/PdfGenerator');

function getCurrentDateTime() {
    // Create a Date object and adjust for Singapore Standard Time (UTC+8)
    const now = new Date();
    const singaporeOffset = 8 * 60; // SST is UTC+8, in minutes
    const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes
    const adjustedTime = new Date(now.getTime() + (singaporeOffset - localOffset) * 60000);

    // Get day, month, year, hours, minutes, and seconds
    const day = String(adjustedTime.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(adjustedTime.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = adjustedTime.getFullYear();

    const hours = String(adjustedTime.getHours()+8).padStart(2, '0'); // Ensure two digits
    const minutes = String(adjustedTime.getMinutes()).padStart(2, '0'); // Ensure two digits
    const seconds = String(adjustedTime.getSeconds()).padStart(2, '0'); // Ensure two digits

    // Format date and time
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    console.log("Now (SST):", formattedDate, formattedTime);

    return {
        date: formattedDate,
        time: formattedTime,
    };
}


router.post('/', async function(req, res, next) 
{
    if(req.body.purpose === "insert")
    {
        var participantsParticulars = req.body.participantDetails;
        
        var controller = new RegistrationController();
        participantsParticulars.official = {
            name: "", // You can set a default or dynamic value
            date: "", // You can set this to the current date using new Date() or any format
            time: "",  // Set the current time or any specific time value
            receiptNo: "",
            remarks: ""
          };
        var result = await controller.newParticipant(participantsParticulars);
        return res.json({"result": result});
    }
    else if(req.body.purpose === "retrieve")
    {
        //console.log("Retrieve From Database")
        var controller = new RegistrationController();
        var result = await controller.allParticipants();
        console.log("Retrieve Payment:", result)
        return res.json({"result": result}); 
    }
    else if(req.body.purpose === "update")
    {
        var id = req.body.id;
        var newStatus = req.body.status;
        var controller = new RegistrationController();
        var result = await controller.updateParticipant(id, newStatus);
        return res.json({"result": result}); 
    }
    else if(req.body.purpose === "updatePayment")
    {
        console.log("Official Use");
        var id = req.body.registration_id;  
        var name = req.body.staff;
        var status = req.body.status;
        const currentDateTime = getCurrentDateTime();
        var date = currentDateTime.date;
        var time = currentDateTime.time;
        var controller = new RegistrationController();
        if(status === "Paid")
        {
            const message = await controller.updateOfficialUse(id, name, date, time, status);
            return res.json({"result": message}); 
        }
        else
        {
            return res.json({"result": true}); 
        }
        // After the PDF is sent, you can send a confirmation response if necessary
        //res.json({ message }); // Send confirmation response
    }
    else if(req.body.purpose === "receipt")
    {
        console.log("Receipt body:", req.body); 
        var controller = new RegistrationController();
        var result = await controller.updateReceiptNumber(req.body.rowData._id, req.body.receiptNo);
        console.log("updateReceiptNumber:", result); 
        console.log("Array:", req.body.rowData);
        const currentDateTime = getCurrentDateTime();
        var date = currentDateTime.date;
        var time = currentDateTime.time;
        console.log("Check:", req.body.rowData._id,  req.body.staff, date, time, req.body.status);
        await controller.updateOfficialUse(req.body.rowData._id, req.body.staff, date, time, req.body.status);
        var pdf = new PdfGenerator();
        var array = []
        array.push(req.body.rowData);
        await pdf.generateReceipt(res, array, req.body.staff, req.body.receiptNo);
    }
    else if(req.body.purpose === "updateRemarks")
    {
        console.log(req.body);
        var controller = new RegistrationController();
        const currentDateTime = getCurrentDateTime();
        var date = currentDateTime.date;
        var time = currentDateTime.time;
        var result = await controller.updateRemarks(req.body.id, req.body.remarks, req.body.staff, date, time);
        console.log("Update Remarks:". result);
        var controller1 = new ReceiptController();
        var result1 = await controller1.deleteReceipt(req.body.id);
        return res.json({"result": result1}); 
    }
    else if(req.body.purpose === "updateEntry")
    {
        console.log("Data:", req.body)
        var controller = new RegistrationController();
        var result = await controller.updateEntry(req.body.entry);
        //console.log(result);
        return res.json({"result": result}); 
    }
});

module.exports = router;

