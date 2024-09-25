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
}

module.exports = CoursesController;
