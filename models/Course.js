import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter course title"],
    minLength: [4, "title must be 4 charater"],
    maxLength: [80, "title cant exceed  80 charater"],
  },
  description: {
    type: String,
    required: [true, "Please enter course title"],
    minLength: [10, "description must be 20 charater"],
  },
  lectures: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  views: {
    type: Number,
    default: 0,
  },
  numOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: [true, "Enter Course Creator Name"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const Course = mongoose.model("Course", schema);
