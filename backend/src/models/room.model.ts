
import { model, Schema } from "mongoose";
import { IRoom } from "../types";

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Room = model<IRoom>("Room", RoomSchema);

export default Room;
