import React from 'react';
import './Chat.css';

export default function Chat() {
  return (
    <div className="container chat-layout">
      <aside className="chat-sidebar desktop-only">
        <h3>Conversations</h3>
        <div className="chat-thread active">Casio Calculator</div>
        <div className="chat-thread">Engineering Book</div>
      </aside>
      <main className="chat-main">
        <div className="chat-header">
          <strong>Casio Calculator</strong>
          <span className="chat-status">Rahul</span>
        </div>
        <div className="chat-messages">
          <div className="message received">Hi, is this available?</div>
          <div className="message sent">Yes, it is.</div>
        </div>
        <div className="chat-input-area">
          <input type="text" className="chat-input" placeholder="Type a message..." />
          <button className="chat-send">Send</button>
        </div>
      </main>
    </div>
  );
}