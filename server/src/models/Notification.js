import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  type: {
    type: String,
    enum: ["review", "review_permission"],
    required: true,
  },
  link: String,
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("notifications", notificationSchema);
export default Notification;
