var express = require("express"); 
var router = express.Router();
var CoursesController = require("../Controller/Courses/CoursesController");

router.post("/", async function(req, res) {
    console.log("Request Data:", req.body);
    var courseType = req.body.courseType;
    var type = req.body.type;
    var status = req.body.status;
    var page = req.body.page;
    console.log("Course Type:", courseType);
  
    var controller = new CoursesController();
    try 
    {
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
            else if(type === "update")
            {
              const productId = await controller.getProductID(page);
              console.log("Product ID:", productId);
              const updateProductStock = await controller.updateProductStock(productId, status);
              //console.log("Update Product Stock:", updateProductStock);
              if(updateProductStock === "Stock Updated Successfully")
              {
                return res.json({"result":true});
              }
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
