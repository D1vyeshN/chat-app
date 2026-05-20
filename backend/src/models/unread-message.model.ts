import { model, Schema } from "mongoose";

const UnreadMessageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

UnreadMessageSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default model("UnreadMessage", UnreadMessageSchema);
