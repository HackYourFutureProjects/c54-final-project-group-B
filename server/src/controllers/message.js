import Message from "../models/Message.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import { logError } from "../util/logging.js";

export const getMessagesByRoom = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, result: messages });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to fetch messages" });
  }
};

export const getInbox = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const msg = conv.lastMessage;
        const otherUserId =
          msg.senderId.toString() === userId.toString()
            ? msg.receiverId
            : msg.senderId;

        const otherUser = await User.findById(otherUserId).select("name email");
        const listing = await Listing.findById(msg.listingId).select(
          "title images",
        );

        return {
          room: msg.room,
          lastMessage: msg,
          otherUser,
          listing,
        };
      }),
    );

    res.status(200).json({ success: true, result: populatedConversations });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to fetch inbox" });
  }
};
