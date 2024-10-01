var WooCommerceConnection = require("../../wooCommerce/WooCommerceConnection"); // Import the class


// Async function to test the connection
async function initialize(api) {
  try {
    // Test the connection by fetching basic store info
    const response = await api.get(""); // Await the API call
    return { "status": "Success", "message": "Connection Successfully" };
  } catch (error) {
    // Handle errors during the API request
    if (error.response) {
      return { "status": "Error", "message": error.response.data };
    } else if (error.request) {
      return { "status": "Error", "message": error.request };
    } else {
      return { "status": "Error", "message": error.message };
    }
  }
}


// Function to fetch and filter products
async function fetchNSAProducts(api) 
{
  let allProducts = [];
  let page = 1;
  const perPage = 100; // Number of products per page (max 100 per WooCommerce API settings)

  while (true) {
    try {
      // Fetch a page of products
      const response = await api.get("products", { per_page: perPage, page: page }); // Await the API call
      const products = response.data;

      if (products.length === 0) {
        break; // Exit the loop if no more products are returned
      }

      // Filter products on the current page
      const filteredProducts = products.filter(product =>
        product.status === "publish" &&
        product.categories &&
        product.categories.length === 2 &&
        product.categories[1].name === "Tri-Love Elderly: NSA"
      );

      allProducts = allProducts.concat(filteredProducts); // Add filtered products to the array
      page++; // Move to the next page
    } catch (error) {
      if (error.response) {
        console.error("Error with the response:", error.response.data);
        console.error("Status code:", error.response.status);
        break; // Exit the loop on error
      } else if (error.request) {
        console.error("No response received:", error.request);
        break; // Exit the loop on error
      } else {
        console.error("Error in request setup:", error.message);
        break; // Exit the loop on error
      }
    }
  }

  return allProducts; // Return all filtered products
}

// Function to fetch and filter products
async function fetchILPProducts(api) {
  let allProducts = [];
  let page = 1;
  const perPage = 100; // Number of products per page (max 100 per WooCommerce API settings)

  while (true) {
    try {
      // Fetch a page of products
      const response = await api.get("products", { per_page: perPage, page: page }); // Await the API call
      const products = response.data;

      if (products.length === 0) {
        break; // Exit the loop if no more products are returned
      }

      // Filter products on the current page
      var filteredProducts = products.filter(product =>
        product.status === "publish" &&
        product.categories &&
        product.categories.length === 2 &&
        product.categories[1].name === "Tri-Love Elderly: ILP"
      );

      allProducts = allProducts.concat(filteredProducts); // Add filtered products to the array
      page++; // Move to the next page
    } catch (error) {
      if (error.response) {
        console.error("Error with the response:", error.response.data);
        console.error("Status code:", error.response.status);
        break; // Exit the loop on error
      } else if (error.request) {
        console.error("No response received:", error.request);
        break; // Exit the loop on error
      } else {
        console.error("Error in request setup:", error.message);
        break; // Exit the loop on error
      }
    }
  }

  return allProducts; // Return all filtered products
}

class CoursesController {
  constructor() {
    this.wooCommerce = new WooCommerceConnection(); // Initialize WooCommerceConnection
    this.api = this.wooCommerce.getApi(); // Correctly get the API instance
  }

  // Method to test the connection
  async initialize() {
    const result = await initialize(this.api); // Pass the API instance to the test function
    return result.status;
  }

  async getNSAProducts() { 
    try {
        var products = await fetchNSAProducts(this.api);
        //console.log("Fetched NSA Products:", products); // Log the data
        return products;
    } catch (error) {
        console.error("Error fetching NSA products:", error);
        throw new Error("Error fetching NSA products");
    }
  }

  async getILPProducts() { 
    try {
        var products = await fetchILPProducts(this.api);
        //console.log("Fetched NSA Products:", products); // Log the data
        return products;
    } catch (error) {
        console.error("Error fetching ILP products:", error);
        throw new Error("Error fetching ILP products");
    }
  }

  async getProductID(productName, perPage = 100) {
    try {
      let page = 1;
      let productId = null;
      let products;
  
      do {
        // Fetch products for the current page
        const response = await this.api.get("products", {
          page: page,         // Current page number
          per_page: perPage   // Number of products per page
        });
  
        products = response.data; // Get products from the response
  
        // Check each product for a match
        for (let product of products) {

          if (product.name === productName) {
            productId = product.id; // Store the product ID if found
            break; // Exit the loop if the product is found
          }
        }
  
        page++; // Move to the next page
      } while (products.length > 0 && productId === null); // Continue until no more products or found the ID
  
      return productId;
    } catch (error) {
      console.error("Error fetching product ID:", error);
      throw new Error("Error fetching product ID");
    }
  }
  
  async updateProductStock(productId, status) 
  {
    try {
        // Fetch current product details
        const response = await this.api.get(`products/${productId}`);
        const product = response.data;
        console.log("Update Product Stocks:", status);

        // Check the current stock quantity
        let newStockQuantity = product.stock_quantity;

        var array = product.short_description.split("<p>");
        if (array[0] === '') {
          array.shift(); // Remove the empty string at the start
        }
        var vacancies = array.flatMap(item => item.replace(/\n|<b>|<\/b>/g, "")).find(item => item.toLowerCase().includes("vacancy")).split("<br />").pop().trim().split("/")[2];
        var vacanciesMatch = parseInt(vacancies.match(/\d+/));

        console.log("Current:", product.stock_quantity);
        console.log(status === "Cancelled");

        var updateData;
        if(vacanciesMatch < newStockQuantity)
        {
          newStockQuantity = vacanciesMatch; // Increase stock by 1 if cancelled
        }
        else if((vacanciesMatch => newStockQuantity) && (newStockQuantity > 0))
        {
          if (status === "Cancelled") 
          {
            newStockQuantity += 1; // Increase stock by 1 if cancelled
          } 
          else if (status === "Paid") 
          {
            console.log("Decrease");
            newStockQuantity -= 1; // Decrease stock by 1 if paid
          }   
        }
        else if(newStockQuantity <= 0)
        {
          newStockQuantity = 0;
        }

       updateData = {
          stock_quantity: newStockQuantity
        };

        // Update the product stock
        await this.api.post(`products/${productId}`, updateData);

        console.log(`Stock updated for product ID ${productId}: New quantity is ${newStockQuantity}`);
    } catch (error) {
        console.error("Error updating product stock:", error);
        throw new Error("Error updating product stock");
    }
  } 
}

module.exports = CoursesController;
