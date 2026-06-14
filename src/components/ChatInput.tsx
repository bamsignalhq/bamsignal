import { Send } from "lucide-react";
import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  blockWarning?: string;
  onClearWarning?: () => void;
};

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
  blockWarning = "",
  onClearWarning
}: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="chat-input-wrap">
      {blockWarning && <p className="chat-block-warning">{blockWarning}</p>}
      <div className="chat-input-row">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (blockWarning && onClearWarning) onClearWarning();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Message"
        />
        <button
          type="button"
          className="chat-send-btn"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
