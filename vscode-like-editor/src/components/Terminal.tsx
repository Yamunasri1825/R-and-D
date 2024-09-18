import React, { useState } from 'react'
import '../styles/Terminal.css'

const Terminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('TERMINAL')

  const tabs = ['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL', 'PORTS']

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
            <div className="terminal-line">
              {/* <span className="terminal-time">5:51:59 pm</span> <span className="terminal-info">[vite]</span> hmr update /src/index.css */}
            </div>
            {/* <div className="terminal-line">
              &gt; Welcome to the terminal
            </div> */}
          </div>
        )}
        {activeTab !== 'TERMINAL' && (
          <div className="terminal-placeholder">
            {activeTab} content goes here
          </div>
        )}
      </div>
    </div>
  )
}

export default Terminal