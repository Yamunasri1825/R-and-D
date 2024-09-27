import React, { useState } from 'react';
import '../styles/Terminal.css';

const Terminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('TERMINAL');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string[]>([]);

  const tabs = ['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL', 'PORTS'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = input;
      setOutput(prev => [...prev, `$ ${command}`]);
      setInput('');

      // Send command to the backend
      try {
        const response = await fetch('http://localhost:5000/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command }),
        });
        const data = await response.json();
        setOutput(prev => [...prev, data.output]);
      } catch (error) {
        setOutput(prev => [...prev, `Error: ${error.message}`]);
      }
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`terminal-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="terminal-content">
        {activeTab === 'TERMINAL' && (
          <div className="terminal-output">
            {output.map((line, index) => (
              <div key={index} className="terminal-line">{line}</div>
            ))}
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleInputSubmit}
              placeholder="Type a command..."
            />
          </div>
        )}
        {activeTab !== 'TERMINAL' && (
          <div className="terminal-placeholder">
            {activeTab} content goes here
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;