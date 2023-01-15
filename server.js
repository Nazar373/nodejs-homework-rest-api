const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require('./app')

mongoose.set("strictQuery", false);
dotenv.config();

const { DB_HOST } = process.env;

async function main() {
  try {
    await mongoose.connect(DB_HOST);
    console.log("Database connection successful");
    
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000")
    })
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

main();
