const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

class WooCommerceConnection {
  constructor() {
    // Create a new instance of the WooCommerce API
    this.api = new WooCommerceRestApi({
      url: "https://ecss.org.sg", // Store URL
      consumerKey: 'ck_be09fee650a20cf08d693e4fe88d340a8f2c63ec', // API key
      consumerSecret: 'cs_37a64021bcb71424551c4c5a1f56ad7c5dc05dbb', // Secret
      version: "wc/v3" // API version
    });
  }

  // Method to get the API instance
  getApi() {
    return this.api;
  }
}

module.exports = WooCommerceConnection; // Export the class itself
