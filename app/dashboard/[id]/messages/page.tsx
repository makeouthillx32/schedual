'use client';

import { useEffect, useRef, useState } from 'react';
import ChatSidebar, { Conversation } from './_components/ChatSidebar';
import ChatHeader from './_components/ChatHeader';
import ChatMessages from './_components/ChatMessages';
import MessageInput from './_components/MessageInput';
import ChatRightSidebar from './_components/ChatRightSidebar';

// This will be replaced with real API data
const MOCK_MESSAGES = [
  { id: 1, sender: { id: 'jeff', name: 'Jeff', avatar: 'JE', email: 'jeff@lamorre.co' }, content: 'Come back to Whistler and ski with us!!!', timestamp: '2023-10-17T14:25:00Z', likes: 1, image: '/mountains.jpg' },
  { id: 2, sender: { id: 'al', name: 'Al', avatar: 'AL', email: 'alamorre@gmail.com' }, content: "I'm coming back in November actually. Going skiing with pals in Revy then I'll drive out 👋", timestamp: '2023-10-17T14:27:00Z', likes: 0, image: null },
  { id: 3, sender: { id: 'jack', name: 'Jack', avatar: 'JA', email: 'jack@lamorre.co' }, content: 'Pumped to meetup with everybody next weekend!!', timestamp: '2023-10-17T14:29:00Z', likes: 0, image: null },
];

const MOCK_PARTICIPANTS = [
  { id: 'al', name: 'Al', avatar: 'AL', email: 'alamorre@gmail.com', online: true },
  { id: 'jack', name: 'Jack', avatar: 'JA', email: 'jack@lamorre.co', online: true },
  { id: 'jeff', name: 'Jeff', avatar: 'JE', email: 'jeff@lamorre.co', online: true },
];

const avatarColors = {
  AL: 'bg-blue-500',
  JA: 'bg-orange-500',
  JE: 'bg-green-500',
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(true);
  const [showPhotos, setShowPhotos] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    
    // This would be replaced with an API call to send a message
    console.log('Sending message:', message, 'to conversation:', selectedChat.id);
    setMessage('');
  };

  if (!selectedChat) {
    return (
      <div className="flex h-screen bg-white dark:bg-gray-dark text-gray-900 dark:text-white">
        <ChatSidebar
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
            <p className="text-gray-500">Choose an existing conversation or start a new one</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-dark text-gray-900 dark:text-white">
      <ChatSidebar
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader 
          name={selectedChat.name} 
          timestamp={selectedChat.last_message_at || ''} 
          isGroup={selectedChat.is_group}
        />
        <ChatMessages
          messages={MOCK_MESSAGES}
          currentUserId="al"
          messagesEndRef={messagesEndRef}
          avatarColors={avatarColors}
        />
        <MessageInput
          message={message}
          onSetMessage={setMessage}
          handleSendMessage={handleSendMessage}
        />
      </div>

      <ChatRightSidebar
        selectedChatName={selectedChat.name}
        participants={MOCK_PARTICIPANTS}
        avatarColors={avatarColors}
        isGroup={selectedChat.is_group}
      />
    </div>
  );
}


















// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';
// import { Send, PaperClip, ChevronDown, PlusCircle } from 'lucide-react';

// // Mock data - would be replaced with actual data from your database
// const MOCK_CHATS = [
//   { id: 1, name: 'Family Chat 👨‍👩‍👧‍👦', lastMessage: "I'm coming back in November", timestamp: '2023-10-17T12:00:00Z', unread: false },
//   { id: 2, name: 'Zack Goldberg', lastMessage: 'Say hello!', timestamp: '2023-10-16T15:30:00Z', unread: true },
//   { id: 3, name: 'Alice Appleseed', lastMessage: 'Say hello!', timestamp: '2023-10-15T09:20:00Z', unread: false },
//   { id: 4, name: 'John Smith', lastMessage: 'Say hello!', timestamp: '2023-10-14T18:45:00Z', unread: false },
//   { id: 5, name: 'Wifey 😍', lastMessage: 'Say hello!', timestamp: '2023-10-13T21:10:00Z', unread: false },
//   { id: 6, name: 'Roomies 🏠', lastMessage: 'Say hello!', timestamp: '2023-10-12T17:30:00Z', unread: false },
//   { id: 7, name: 'Hockey 🏒 Fantasy', lastMessage: '', timestamp: '2023-10-11T14:15:00Z', unread: false },
// ];

// const MOCK_MESSAGES = [
//   { 
//     id: 1, 
//     sender: { id: 'jeff', name: 'Jeff', avatar: 'JE', email: 'jeff@lamorre.co' }, 
//     content: 'Come back to Whistler and ski with us!!!', 
//     timestamp: '2023-10-17T14:25:00Z',
//     likes: 1,
//     image: '/mountains.jpg'
//   },
//   { 
//     id: 2, 
//     sender: { id: 'al', name: 'Al', avatar: 'AL', email: 'alamorre@gmail.com' }, 
//     content: "I'm coming back in November actually. Going skiing with pals in Revy then I'll drive out 👋", 
//     timestamp: '2023-10-17T14:27:00Z',
//     likes: 0,
//     image: null
//   },
//   { 
//     id: 3, 
//     sender: { id: 'jack', name: 'Jack', avatar: 'JA', email: 'jack@lamorre.co' }, 
//     content: 'Pumped to meetup with everybody next weekend!!', 
//     timestamp: '2023-10-17T14:29:00Z',
//     likes: 0,
//     image: null
//   }
// ];

// const MOCK_PARTICIPANTS = [
//   { id: 'al', name: 'Al', avatar: 'AL', email: 'alamorre@gmail.com', online: true },
//   { id: 'jack', name: 'Jack', avatar: 'JA', email: 'jack@lamorre.co', online: true },
//   { id: 'jeff', name: 'Jeff', avatar: 'JE', email: 'jeff@lamorre.co', online: true }
// ];

// export default function ChatPage() {
//   const [selectedChat, setSelectedChat] = useState(MOCK_CHATS[0]);
//   const [message, setMessage] = useState('');
//   const messagesEndRef = useRef(null);
//   const [showParticipants, setShowParticipants] = useState(true);
//   const [showPhotos, setShowPhotos] = useState(true);

//   // Scroll to bottom of messages on load and new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [MOCK_MESSAGES]);

//   // This would be replaced with actual data fetching logic
//   useEffect(() => {
//     // Fetch chats, messages, participants data
//   }, []);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;
    
//     // This would be replaced with actual message sending logic
//     console.log('Sending message:', message);
    
//     setMessage('');
//   };

//   const getInitials = (name) => {
//     return name
//       .split(' ')
//       .map(part => part[0])
//       .join('')
//       .toUpperCase();
//   };

//   const avatarColors = {
//     AL: 'bg-blue-500',
//     JA: 'bg-orange-500',
//     JE: 'bg-green-500'
//   };

//   return (
//     <div className="flex h-screen bg-white dark:bg-gray-dark text-gray-900 dark:text-white">
//       {/* Left sidebar */}
//       <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col">
//         <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
//           <h1 className="text-xl font-semibold">My Chats</h1>
//           <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
//             <PlusCircle size={20} />
//           </button>
//         </div>
        
//         <div className="overflow-y-auto flex-1">
//           {MOCK_CHATS.map(chat => (
//             <div 
//               key={chat.id} 
//               className={`p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedChat.id === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
//               onClick={() => setSelectedChat(chat)}
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="font-medium">{chat.name}</h3>
//                 {chat.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
//               </div>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{chat.lastMessage}</p>
//             </div>
//           ))}
//         </div>
//       </div>
      
//       {/* Main chat area */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-center">
//           <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
//           <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
//             Active 2:21 PM, Sun, Oct 17, 2021
//           </span>
//         </div>
        
//         <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
//           {MOCK_MESSAGES.map((msg) => (
//             <div key={msg.id} className="mb-4">
//               <div className={`flex items-start ${msg.sender.id === 'al' ? 'justify-end' : ''}`}>
//                 {msg.sender.id !== 'al' && (
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${avatarColors[msg.sender.avatar]}`}>
//                     {msg.sender.avatar}
//                   </div>
//                 )}
                
//                 <div className={`mx-2 max-w-[70%] ${msg.sender.id === 'al' ? 'bg-blue-500 text-white rounded-l-lg rounded-br-lg' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg rounded-bl-lg'}`}>
//                   {msg.image && (
//                     <div className="p-1">
//                       <div className="relative w-64 h-40 rounded-md overflow-hidden">
//                         <Image 
//                           src="/api/placeholder/300/200" 
//                           alt="Message attachment" 
//                           width={300}
//                           height={200}
//                           style={{ objectFit: "cover" }}
//                         />
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="p-3">
//                     <p>{msg.content}</p>
//                   </div>
//                 </div>
                
//                 {msg.sender.id === 'al' && (
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${avatarColors[msg.sender.avatar]}`}>
//                     {msg.sender.avatar}
//                   </div>
//                 )}
//               </div>
              
//               {/* Like button and counter */}
//               {msg.likes > 0 && (
//                 <div className={`flex ${msg.sender.id === 'al' ? 'justify-end mr-12' : 'justify-start ml-12'}`}>
//                   <div className="bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                     👍
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>
        
//         <div className="p-4 border-t border-gray-200 dark:border-gray-800">
//           <form onSubmit={handleSendMessage} className="flex items-center">
//             <input
//               type="text"
//               placeholder="Send a message..."
//               className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-full py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-opacity-50"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//             />
//             <button 
//               type="submit" 
//               className="bg-blue-500 hover:bg-blue-600 p-2 rounded-r-full text-white"
//             >
//               <Send size={20} />
//             </button>
//           </form>
//         </div>
//       </div>
      
//       {/* Right sidebar */}
//       <div className="w-64 border-l border-gray-200 dark:border-gray-800 flex flex-col">
//         <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-center">
//           <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
//         </div>
        
//         <div className="p-4 border-b border-gray-200 dark:border-gray-800">
//           <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setShowParticipants(!showParticipants)}>
//             <h3 className="font-medium">People</h3>
//             <ChevronDown className={`transform ${showParticipants ? '' : '-rotate-90'} transition-transform`} size={18} />
//           </div>
          
//           {showParticipants && (
//             <div>
//               {MOCK_PARTICIPANTS.map(participant => (
//                 <div key={participant.id} className="flex items-center mt-2">
//                   <div className="relative">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${avatarColors[participant.avatar]}`}>
//                       {participant.avatar}
//                     </div>
//                     {participant.online && (
//                       <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
//                     )}
//                   </div>
//                   <div className="ml-2">
//                     <p className="text-sm text-gray-700 dark:text-gray-300">{participant.email}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <div className="p-4">
//           <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setShowPhotos(!showPhotos)}>
//             <h3 className="font-medium">Photos</h3>
//             <ChevronDown className={`transform ${showPhotos ? '' : '-rotate-90'} transition-transform`} size={18} />
//           </div>
          
//           {showPhotos && (
//             <div className="grid grid-cols-3 gap-1">
//               <div className="aspect-square rounded overflow-hidden border border-gray-200 dark:border-gray-700">
//                 <Image 
//                   src="/api/placeholder/100/100" 
//                   alt="Shared photo" 
//                   width={80}
//                   height={80}
//                   style={{ objectFit: "cover" }}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }