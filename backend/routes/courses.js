var express = require("express"); 
var router = express.Router();
var CoursesController = require("../Controller/Courses/CoursesController");

router.post("/", async function(req, res) {
    var courseType = req.body.courseType;
    console.log("Course Type:", courseType);
  
    var controller = new CoursesController();
    try {
      const connectionStatus = await controller.initialize();
      
        if (connectionStatus === "Success") 
        {
            if (courseType === "NSA") 
            {
                const products = await controller.getNSAProducts();
                return res.json(products); // Send the products as a response
            }
            else if(courseType === "ILP") 
            {
                const products = await controller.getILPProducts();
                return res.json(products); // Send the products as a response
            }
            else
            {
                return res.status(400).send("Invalid courseType");
            }
        } 
        else 
        {
            return res.status(500).send("Failed to initialize connection");
        }
    } catch (error) {
      console.error("Error:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  });
  
module.exports = router;
