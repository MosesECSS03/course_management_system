var express = require("express"); 
var router = express.Router();
var ILPCoursesController = require("../Controller/Courses/ILPCoursesController");

// Define a route to handle GET requests
router.post("/", async function(req, res) {
    try {
        // Create an instance of NSACoursesController
        var controller = new ILPCoursesController();
        
        // Initialize and fetch filtered products
        var products = await controller.initialize(); 
        res.json(products);
    } catch (error) {
        // Handle errors
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
