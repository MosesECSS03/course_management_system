var express = require('express');
var router = express.Router();
var AccessRightController = require('../Controller/Account/AccessRightController'); 

router.post('/', async function(req, res, next) 
{
    if(req.body.purpose === "retrieve")
    {
        var controller = new AccessRightController();
        var result = await controller.allAccountsWithAccessRight();
        return res.json({"result": result}); 
    }
});

module.exports = router;
