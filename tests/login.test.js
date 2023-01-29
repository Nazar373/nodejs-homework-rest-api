require("dotenv").config();
const supertest = require("supertest");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const app = require("../app");
const { DB_HOST } = process.env;
const { User } = require("../models/user");

describe("login", () => {
  beforeAll(async () => {
    jest.setTimeout(10000);
    await mongoose.connect(DB_HOST);
  });

  afterAll(async () => {
    jest.setTimeout(10000);
    await mongoose.disconnect(DB_HOST);
  });

  it("statusCode = 200", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "user@gmail.com",
      password: "user123",
    });

    expect(response.statusCode).toBe(200);
  });

  it("token is valid", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "user@gmail.com",
      password: "user123",
    });
    const user = await User.findOne({ email: "user@gmail.com" });
    
    expect(response.body.data.token).toBe(user.token);
  });

  it("email and subcription fields is valid", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "user@gmail.com",
      password: "user123",
    });
    const user = await User.findOne({ email: "user@gmail.com" });
    
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.body.data.user.subscription).toBe(user.subscription)
  });
});
