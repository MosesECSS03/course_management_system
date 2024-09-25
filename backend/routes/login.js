var express = require("express");
var router = express.Router();
var LoginController = require('../Controller/User/LoginController');

async function onLogin(email, password)
{
    var result = await LoginController.login(email, password);
    return result;
}

router.post("/", async function(req, res) 
{
    var email = req.body.email;
    var password = req.body.password;
    //console.log(email, password);
    var test = await onLogin(email, password)
    console.log(test);
});

module.exports = router;