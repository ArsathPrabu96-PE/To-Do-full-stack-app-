// Lightweight chatbot module
(function(){
  const toggle = document.getElementById('chatbot-toggle');
  const chatbot = document.getElementById('chatbot');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  if (!chatbot) return;

  function addMessage(text, cls='bot'){
    const div = document.createElement('div');
    div.className = `chat-bubble ${cls}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function localFallback(query){
    // Simple local responder for offline/demo use
    const q = query.toLowerCase();
    if (q.includes('todo')) return 'You can add todos using the To-Do section. Try the + button.';
    if (q.includes('login')) return 'Use the Login link to sign in. If you don\'t have an account, sign up first.';
    if (q.includes('help')) return 'Describe the issue and I\'ll try to point you to the right section.';
    return `Sorry, I\'m a local demo bot. You asked: "${query}"`;
  }

  async function sendQuery(q){
    addMessage(q, 'user');
    // Try backend endpoint first
    try{
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      addMessage(data.reply || data.message || 'No reply', 'bot');
      return;
    }catch(err){
      // fallback
      const reply = localFallback(q);
      addMessage(reply, 'bot');
    }
  }

  toggle.addEventListener('click', () => {
    chatbot.classList.toggle('chatbot-open');
    chatbot.classList.toggle('chatbot-closed');
  });

  sendBtn.addEventListener('click', () => {
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    sendQuery(q);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Welcome message
  addMessage('Hi! I\'m a demo chatbot. Ask me about the app or type "help".', 'bot');
})();
