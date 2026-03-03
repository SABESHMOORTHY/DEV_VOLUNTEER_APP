import { useState, useEffect } from 'react';
import { authService, chatService, notificationService } from '../services/authService';
import { MessageCircle, Bell, Send, User } from 'lucide-react';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [requestForm, setRequestForm] = useState({
    serviceType: '',
    location: '',
    urgency: 'MEDIUM',
    description: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadVolunteers();
    loadNotifications(currentUser?.id);
  }, []);

  const loadVolunteers = async () => {
    const res = await fetch('/api/volunteers/active');
    const data = await res.json();
    setVolunteers(data);
  };

  const loadNotifications = async (userId) => {
    if (!userId) return;
    const data = await notificationService.getNotifications(userId, 'unread');
    setNotifications(data);
  };

  const loadMessages = async (otherUserId) => {
    if (!user) return;
    const data = await chatService.getMessages(user.id, otherUserId);
    setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedVolunteer) return;
    await chatService.sendMessage(user.id, selectedVolunteer.id, messageText);
    setMessageText('');
    loadMessages(selectedVolunteer.id);
  };

  const handleSubmitRequest = async () => {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterName: user.name,
        requesterContact: user.contactNumber,
        selectedVolunteerId: selectedVolunteer?.id,
        ...requestForm
      })
    });
    if (res.ok) {
      alert('Request submitted successfully!');
      setRequestForm({ serviceType: '', location: '', urgency: 'MEDIUM', description: '' });
    }
  };

  const openChat = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowChat(true);
    loadMessages(volunteer.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="cursor-pointer" />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
          <span>{user?.name}</span>
        </div>
      </nav>

      <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Submit Service Request</h2>
          <div className="space-y-4">
            <input
              placeholder="Service Type"
              value={requestForm.serviceType}
              onChange={(e) => setRequestForm({...requestForm, serviceType: e.target.value})}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              placeholder="Location"
              value={requestForm.location}
              onChange={(e) => setRequestForm({...requestForm, location: e.target.value})}
              className="w-full px-4 py-2 border rounded"
            />
            <select
              value={requestForm.urgency}
              onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <textarea
              placeholder="Description"
              value={requestForm.description}
              onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
              className="w-full px-4 py-2 border rounded"
              rows="3"
            />
            <button
              onClick={handleSubmitRequest}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Submit Request
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Available Volunteers</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {volunteers.map((vol) => (
              <div key={vol.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{vol.name}</p>
                  <p className="text-sm text-gray-600">{vol.location} • ⭐ {vol.rating}</p>
                </div>
                <button
                  onClick={() => openChat(vol)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showChat && selectedVolunteer && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl">
          <div className="bg-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <span>Chat with {selectedVolunteer.name}</span>
            <button onClick={() => setShowChat(false)} className="text-white">✕</button>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded ${msg.senderId === user.id ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  {msg.messageText}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
