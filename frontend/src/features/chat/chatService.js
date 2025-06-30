// src/features/chat/chatService.js
import axios from '../../utils/axios'; // your axios instance with token

const getAllChats = () => axios.get('/chats');
const startChat   = (userId) => axios.post('/chats/start', { userId });

export default {
  getAllChats,
  startChat
};
