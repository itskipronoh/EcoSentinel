import React, { useState } from 'react';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: 'user' }]);
            setInput('');
            // Simulate a response from the assistant
            setTimeout(() => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { text: 'This is a simulated response.', sender: 'assistant' }
                ]);
            }, 1000);
        }
    };

    return (
        <div>
            <button 
                className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full p-3 shadow-lg"
                onClick={toggleChat}
            >
                💬
            </button>
            {isOpen && (
                <div className="fixed bottom-16 right-4 w-80 bg-white rounded-lg shadow-lg">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
                        <h3 className="font-semibold">EcoSentinel AI Assistant</h3>
                        <button 
                            className="absolute top-2 right-2 text-white"
                            onClick={toggleChat}
                        >
                            ✖️
                        </button>
                    </div>
                    <div className="p-4 h-60 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`my-2 p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t">
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded" 
                            placeholder="Type a message..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            className="mt-2 bg-blue-500 text-white rounded p-2 w-full"
                            onClick={handleSendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatAssistant;