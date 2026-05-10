import { model, Schema } from "mongoose";
import { IMessage } from "../types";

const MessageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  },
);

const Message = model<IMessage>("Message", MessageSchema);

export default Message;
