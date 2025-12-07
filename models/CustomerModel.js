const { default: mongoose } = require("mongoose");
const { generateId } = require("../services/CounterService");
const { ROLES } = require("../config/Constants");

const customerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: ROLES.CUSTOMER,
    immutable: true, // Prevents changing the role after creation
  },
  passwordTries: {
    type: Number,
    default: 0,
    required: false,
  },
  lockUntil: {
    type: Date,
    default: null, // Date after which the account unlocks
  },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE",
  },
  activeAccessToken: {
    type: String,
    required: false,
  },
  destination: {
    type: String,
    required: false,
  },
});

customerSchema.pre("save", async function (next) {
  if (this.isNew) {
    const id = await generateId("customer");
    this._id = id;
  }
  next();
});
const CustomerModel = mongoose.model("customer", customerSchema);
module.exports = CustomerModel;
