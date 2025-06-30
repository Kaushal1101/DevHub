// src/features/message/messageService.js
import axios from '../../utils/axios';

const getMessages = (chatId) => axios.get(`/messages/${chatId}`);
const sendMessage = (chatId, content) => axios.post('/messages', { chatId, content });

export default { getMessages, sendMessage };
