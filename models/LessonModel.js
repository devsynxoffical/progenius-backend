const { default: mongoose } = require("mongoose");
const { generateId } = require("../services/CounterService");

const lessonSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  chapter: {
    type: String,
    ref: "chapter",
    required: true,
  },
  videos: [
    {
      title: { type: String, required: false }, // Title for each video
      url: { type: String, required: false }, // Video URL
    },
  ],
  quizes: [
    {
      title: { type: String, required: false }, // Title for each quiz
      url: { type: String, required: false }, // Quiz URL
    },
  ],
  pdfs: [
    {
      title: { type: String, required: false }, // Title for each quiz
      file: { type: String, required: false }, // Quiz URL
      destination: {
        type: String,
        required: false,
      },
    },
  ],
});

lessonSchema.pre("save", async function (next) {
  if (this.isNew) {
    const id = await generateId("lesson");
    this._id = id;
  }
  next();
});
const LessonModel = mongoose.model("lesson", lessonSchema);
module.exports = LessonModel;
