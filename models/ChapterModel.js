const { default: mongoose } = require("mongoose");
const { generateId } = require("../services/CounterService");

const chapterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
    required: false,
  },
  course: {
    type: String,
    ref: "course",
    required: true,
  },
});

chapterSchema.pre("save", async function (next) {
  if (this.isNew) {
    const id = await generateId("chapter");
    this._id = id;
  }
  next();
});
const ChapterModel = mongoose.model("chapter", chapterSchema);
module.exports = ChapterModel;
