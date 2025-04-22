import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  return (
    <>
      <h1 className='main-title'>🍕Pizz-AI🍕</h1>
      <ChatCard />
    </>
  )
}

function ChatCard() {
  const [messages, setMessages] = useState([])
  const [file, setFile] = useState(null)
  const [modalSrc, setModalSrc] = useState(null)

  const handleSend = async (text) => {
    if (!text.trim()) return

    // invio request
    setMessages(prev => [{ id: Date.now(), text, sender: 'user' }, ...prev])
    const form = new FormData()
    form.append('message', text)
    if (file) form.append('file', file)

    try {
      const res = await fetch('http://localhost:5000/chat', { method: 'POST', body: form })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()

      // messaggio ritornato dalle API
      const botMsg = { id: Date.now()+1, text: data.message, sender: 'bot' }
      if (file) {
        const url = URL.createObjectURL(file)
        botMsg.fileUrl = url
      }
      setMessages(prev => [botMsg, ...prev])
    } catch (err) {
      setMessages(prev => [{ id: Date.now()+1, text: `Connection error: ${err.message}`, sender: 'bot' }, ...prev])
    } finally {
      setFile(null)
    }
  }

  return (
    <div className='chat-card'>
      <div className='chat-messages'>
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.text}<br/>
            {msg.sender === 'bot' && msg.fileUrl && (
              <button className='btn btn-send' onClick={() => setModalSrc(msg.fileUrl)}>
                Visualizza file
              </button>
            )}
          </div>
        ))}
      </div>
      <ChatInput onSend={handleSend} onFileSelect={setFile} fileName={file?.name} placeholder='Type your question here...' />
      {modalSrc && (
        <div className='modal-overlay' onClick={() => setModalSrc(null)}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <button className='btn btn-send' onClick={() => setModalSrc(null)}>Chiudi</button>
            <object data={modalSrc} type='application/pdf' width='100%' height='700px'>
              PDF preview non disponibile
            </object>
          </div>
        </div>
      )}
    </div>
  )
}

function ChatInput({ placeholder, onSend, onFileSelect, fileName }) {
  const [text, setText] = useState('')
  const inputRef = useRef()

  // reset file input
  useEffect(() => { if (!fileName && inputRef.current) inputRef.current.value = '' }, [fileName])

  const send = () => { onSend(text); setText('') }
  const handleAttach = () => inputRef.current.click()

  return (
    <div className='chat-input-wrapper'>
      <textarea
        className='chat-textarea'
        placeholder={placeholder}
        value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key==='Enter'&&e.ctrlKey?(e.preventDefault(), send()):null}
        rows={3}
      />
      <input type='file' accept='application/pdf' style={{display:'none'}} ref={inputRef} onChange={e => onFileSelect(e.target.files[0])} />
      <button className='btn btn-send' onClick={handleAttach}>
        Allega{fileName?`: ${fileName}`:''}
      </button>
      <button className='btn btn-send' onClick={send}>Invia</button>
    </div>
  )
}

export default App