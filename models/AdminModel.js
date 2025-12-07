const { default: mongoose } = require("mongoose");
const { generateId } = require("../services/CounterService");
const { ROLES } = require("../config/Constants");

const adminSchema = new mongoose.Schema({
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
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
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
    default: ROLES.ADMIN,
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
  activeAccessToken: {
    type: String,
    required: false,
  },
  destination: {
    type: String,
    required: false,
  },
});

adminSchema.pre("save", async function (next) {
  if (this.isNew) {
    // `this` now correctly refers to the document
    const id = await generateId("admin");
    this._id = id;
  }
  next();
});
const AdminModel = mongoose.model("admin", adminSchema);
module.exports = AdminModel;
