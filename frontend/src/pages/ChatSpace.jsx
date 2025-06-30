import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import chatService from '../features/chat/chatService';
import { Link } from 'react-router-dom';

const ChatSpace = () => {
  const { user } = useSelector(state => state.auth);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatService.getAllChats();
        setChats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  if (loading) return <p>Loading chats...</p>;

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-semibold mb-3">Your Chats</h2>

      {chats.length === 0 && <p>No chats yet.</p>}

      {chats.map(chat => {
        const other = chat.participants.find(p => p._id !== user._id);
        return (
          <Link
            key={chat._id}
            to={`/chats/${chat._id}`}
            className="block p-3 border rounded hover:bg-gray-100"
          >
            <div className="font-bold">{other.name}</div>
            <div className="text-sm text-gray-500 truncate">
              {chat.latestMessage?.content || 'No messages yet'}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ChatSpace;
