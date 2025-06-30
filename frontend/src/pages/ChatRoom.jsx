import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socket } from '../utils/socket';
import messageService from '../features/message/messageService';
import chatService from '../features/chat/chatService';
import dayjs from 'dayjs';                       // --- NEW (npm i dayjs)

const ChatRoom = () => {
  const { chatId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);        // --- NEW
  const bottomRef = useRef();
  const typingTimeout = useRef(null);                     // --- NEW
  const textareaRef = useRef(null);                       // --- NEW

  /* ---------------- Load chat + history ---------------- */
  useEffect(() => {
    const loadChat = async () => {
      try {
        const [chatRes, msgRes] = await Promise.all([
          chatService.getAllChats(),
          messageService.getMessages(chatId),
        ]);

        const thisChat = chatRes.data.find((c) => c._id === chatId);
        setChat(thisChat);
        setMessages(msgRes.data);
        socket.emit('joinChat', chatId);
      } catch (err) {
        console.error('Failed to load chat', err);
      }
    };
    loadChat();
  }, [chatId]);

  /* ---------------- Scroll to bottom on new messages ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---------------- Live message listener ---------------- */
  useEffect(() => {
    const handleNewMsg = (msg) => {
      if (msg.chat === chatId) setMessages((prev) => [...prev, msg]);
    };
    socket.on('newMessage', handleNewMsg);
    return () => socket.off('newMessage', handleNewMsg);
  }, [chatId]);

  /* ---------------- Typing indicator ---------------- */
  useEffect(() => {
    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);
    socket.on('typing', onTyping);
    socket.on('stopTyping', onStopTyping);
    return () => {
      socket.off('typing', onTyping);
      socket.off('stopTyping', onStopTyping);
    };
  }, []);

  /* ---------------- Send message ---------------- */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await messageService.sendMessage(chatId, text);
      socket.emit('sendMessage', { ...res.data, chat: chatId });
      setMessages((prev) => [...prev, res.data]);
      setText('');
      socket.emit('stopTyping', chatId);        // reset indicator
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  /* ---------------- Handle typing ---------------- */
  const handleChange = (e) => {
    setText(e.target.value);

    // broadcast "typing" with debounce
    socket.emit('typing', chatId);

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', chatId);
    }, 1500);
  };

  /* ---------------- Auto-focus textarea on mount ---------------- */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const otherUser = chat?.participants?.find((p) => p._id !== user._id);

  return (
    <div className="flex flex-col h-[90vh] bg-base-200 text-white p-4">
      {/* Header */}
      <div className="font-bold text-lg border-b border-gray-600 pb-2 mb-3">
        Chat with {otherUser?.full_name || otherUser?.name || 'Unknown User'}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-xs px-3 py-2 rounded ${
              msg.sender._id === user._id
                ? 'bg-indigo-500 text-white self-end ml-auto'
                : 'bg-gray-700'
            }`}
          >
            <p>{msg.content}</p>
            {/* --- NEW timestamp */}
            <span className="text-[0.65rem] text-gray-300">
              {dayjs(msg.createdAt).format('h:mm A')}
            </span>
          </div>
        ))}
        {/* Typing indicator */}
        {isTyping && (
          <div className="text-sm italic text-gray-400">Typing…</div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 rounded px-3 py-2 text-black resize-none"
          value={text}
          onChange={handleChange}
          placeholder="Type your message…"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
