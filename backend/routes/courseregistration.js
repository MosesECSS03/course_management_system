var express = require('express');
var router = express.Router();
var RegistrationController = require('../Controller/Registration/RegistrationController')

router.post('/', async function(req, res, next) 
{
    if(req.body.purpose === "insert")
    {
        var participantsParticulars = req.body.participantDetails;
        
        var controller = new RegistrationController();
        participantsParticulars.official = {
            name: "", // You can set a default or dynamic value
            date: "", // You can set this to the current date using new Date() or any format
            time: ""  // Set the current time or any specific time value
          };
        var result = await controller.newParticipant(participantsParticulars);
        return res.json({"result": result});
    }
    else if(req.body.purpose === "retrieve")
    {
        //console.log("Retrieve From Database")
        var controller = new RegistrationController();
        var result = await controller.allParticipants();
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

});

module.exports = router;
