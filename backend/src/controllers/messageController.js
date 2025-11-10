import Message from "../models/Message.js";
import User from "../models/User.js";

export async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;

    const newMessage = await Message.create({
      sender: senderId,
      recipient: recipientId,
      message
    });

    await newMessage.populate('sender', 'name');
    await newMessage.populate('recipient', 'name');

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMessages(req, res) {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    })
    .populate('sender', 'name')
    .populate('recipient', 'name')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getChatList(req, res) {
  try {
    const userId = req.user.id;

    // Get all users who have chatted with the current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
    .populate('sender', 'name')
    .populate('recipient', 'name')
    .sort({ createdAt: -1 });

    // Create a map of unique chat partners
    const chatPartners = new Map();

    messages.forEach(message => {
      const partnerId = message.sender._id.toString() === userId ? message.recipient._id.toString() : message.sender._id.toString();
      const partner = message.sender._id.toString() === userId ? message.recipient : message.sender;

      if (!chatPartners.has(partnerId)) {
        chatPartners.set(partnerId, {
          user: partner,
          lastMessage: message,
          unreadCount: 0
        });
      }

      // Count unread messages
      if (message.recipient._id.toString() === userId && !message.read) {
        chatPartners.get(partnerId).unreadCount++;
      }
    });

    const chatList = Array.from(chatPartners.values());
    res.json(chatList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function markMessagesAsRead(req, res) {
  try {
    const { senderId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { sender: senderId, recipient: userId, read: false },
      { read: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
