import { Smile, Paperclip, Send } from 'lucide-react';
import './mobile.scss';
// Import already exists, no change needed

export default function MessageInput({
  message,
  onSetMessage,
  handleSendMessage,
}: MessageInputProps) {
  return (
    <div className="message-input">
      <form onSubmit={handleSendMessage} className="message-input-form">
        <button
          type="button"
          className="message-input-icon emoji-button"
        >
          <Smile size={20} />
        </button>

        <button
          type="button"
          className="message-input-icon attach-button"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => onSetMessage(e.target.value)}
          className="message-input-field"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className={`send-button ${message.trim() ? 'active' : 'disabled'}`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}