const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

class WooCommerceConnection {
  constructor() {
    // Create a new instance of the WooCommerce API
    this.api = new WooCommerceRestApi({
      url: "https://ecss.org.sg", // Store URL
      consumerKey: 'ck_64b4cd6275b5d67bb30cf6b8a004974061ca7c12', // API key
      consumerSecret: 'cs_f8b4434b612ee8825ce3778b45b430980cf4ca3d', // Secret
      version: "wc/v3" // API version
    });
  }

  // Method to get the API instance
  getApi() {
    return this.api;
  }
}

module.exports = WooCommerceConnection; // Export the class itself
