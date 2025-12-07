const { default: mongoose } = require("mongoose");
const { generateId } = require("../services/CounterService");

const courseSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
  },
  courseImage: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["PAID", "UNPAID"],
    default: "PAID",
  },
  destination: {
    type: String,
    required: false,
    default: null,
  },
  students: [
    {
      type: String,
      ref: "customer",
      required: false,
    },
  ],
});

courseSchema.pre("save", async function (next) {
  if (this.isNew) {
    const id = await generateId("course");
    this._id = id;
  }
  next();
});
const CourseModel = mongoose.model("course", courseSchema);
module.exports = CourseModel;
