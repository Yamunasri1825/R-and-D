import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import 'xterm/css/xterm.css';
import "../styles/XTermTerminal.css";

interface TerminalInstance {
  id: number;
  terminal: Terminal;
  fitAddon: FitAddon;
  unicode11Addon: Unicode11Addon;
  currentInput: string;
  currentDirectory: string;
  history: string[];
  historyIndex: number;
  isInstalling: boolean;
}

const XTermTerminal: React.FC<{
  onUpdateSidebar: () => void;
  folders: Folder[]; // Add this prop
}> = ({ onUpdateSidebar, folders }) => {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminal, setActiveTerminal] = useState<number | null>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('TERMINAL');

  useEffect(() => {
    if (terminals.length === 0) {
      createNewTerminal();
    }
  }, []);

  useEffect(() => {
    terminals.forEach(term => {
      initializeTerminal(term);
    });

    const handleResize = () => {
      terminals.forEach(term => {
        term.fitAddon.fit();
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [terminals]);

  const initializeTerminal = (term: TerminalInstance) => {
    const termElement = document.getElementById(`terminal-${term.id}`);
    if (termElement && !termElement.hasChildNodes()) {
      term.terminal.open(termElement);
      term.fitAddon.fit();
      term.terminal.write('Welcome to the terminal!\r\n');
      term.terminal.write(`${term.currentDirectory}> `);
      term.terminal.onData(data => handleTerminalInput(term.id, data));
    }
  };

  const createNewTerminal = () => {
    const newTerminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#000000',
        foreground: '#ffffff',
      },
      cols: 80,
      rows: 24,
      convertEol: true,
      allowProposedApi: true
    });
    const fitAddon = new FitAddon();
    const unicode11Addon = new Unicode11Addon();
    newTerminal.loadAddon(fitAddon);
    newTerminal.loadAddon(unicode11Addon);

    const newId = Date.now();
    const terminalInstance: TerminalInstance = {
      id: newId,
      terminal: newTerminal,
      fitAddon: fitAddon,
      unicode11Addon: unicode11Addon,
      currentInput: '',
      currentDirectory: '',
      history: [],
      historyIndex: -1,
      isInstalling: false,
    };

    setTerminals(prevTerminals => [...prevTerminals, terminalInstance]);
    setActiveTerminal(newId);
    setTimeout(() => initializeTerminal(terminalInstance), 0);
  };

  const handleTerminalInput = (terminalId: number, data: string) => {
    const terminal = terminals.find(t => t.id === terminalId);
    if (!terminal) return;

    switch (data) {
      case '\r':
        terminal.terminal.write('\r\n');
        executeCommand(terminalId, terminal.currentInput);
        terminal.history.push(terminal.currentInput);
        terminal.historyIndex = terminal.history.length;
        terminal.currentInput = '';
        break;
      case '\u007F':
        if (terminal.currentInput.length > 0) {
          terminal.currentInput = terminal.currentInput.slice(0, -1);
          terminal.terminal.write('\b \b');
        }
        break;
      case '\u001b[A':
        if (terminal.historyIndex > 0) {
          terminal.historyIndex--;
          terminal.terminal.write('\u001b[2K\r');
          terminal.terminal.write(`${terminal.currentDirectory}> ${terminal.history[terminal.historyIndex]}`);
          terminal.currentInput = terminal.history[terminal.historyIndex];
        }
        break;
      case '\u001b[B':
        if (terminal.historyIndex < terminal.history.length - 1) {
          terminal.historyIndex++;
          terminal.terminal.write('\u001b[2K\r');
          terminal.terminal.write(`${terminal.currentDirectory}> ${terminal.history[terminal.historyIndex]}`);
          terminal.currentInput = terminal.history[terminal.historyIndex];
        } else if (terminal.historyIndex === terminal.history.length - 1) {
          terminal.historyIndex++;
          terminal.terminal.write('\u001b[2K\r');
          terminal.terminal.write(`${terminal.currentDirectory}> `);
          terminal.currentInput = '';
        }
        break;
      default:
        terminal.currentInput += data;
        terminal.terminal.write(data);
    }
  };

// ... (previous imports and component setup remain the same)
const executeCommand = async (terminalId: number, command: string) => {
  const terminal = terminals.find(t => t.id === terminalId);
  if (!terminal) return;
  if (!command.trim()) {
    terminal.terminal.write(`${terminal.currentDirectory}> `);
    return;
  }


  const isInstallCommand = 
    command.startsWith('npm install') || 
    command.startsWith('yarn add') || 
    command.startsWith('pip install') || 
    command.includes(' i ') || 
    command.includes('install') || 
    command.startsWith('npm i') || 
    command.startsWith('yarn i') || 
    command.startsWith('pip i');

  let loaderInterval: NodeJS.Timeout | null = null;

  if (isInstallCommand) {
    setTerminals(prevTerminals =>
      prevTerminals.map(t =>
        t.id === terminalId ? { ...t, isInstalling: true } : t
      )
    );
    terminal.terminal.write('\r\n');
    terminal.terminal.write('\x1b[?25l'); // Hide cursor

    const frames = ['|', '/', '-', '\\'];
    let i = 0;
    loaderInterval = setInterval(() => {
      terminal.terminal.write('\r\x1b[K' + frames[i++ % frames.length] + ' Installing...');
    }, 100);
  }

  try {
    const response = await fetch('http://localhost:3003/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        command,
        currentDirectory: terminal.currentDirectory,
        folders: folders // Pass the current folder structure
      }),
    });
    const data = await response.json();
    
    if (isInstallCommand) {
      if (loaderInterval) {
        clearInterval(loaderInterval);
      }
      terminal.terminal.write('\r\x1b[K'); // Clear the entire line
    }
    
    if (data.error) {
      terminal.terminal.writeln(`\r\nError: ${data.error}`);
    } else {
      if (data.output) {
        terminal.terminal.writeln(`\r\n${data.output}`);
      }
      if (data.newDirectory !== undefined) {
        terminal.currentDirectory = data.newDirectory;
      }
      onUpdateSidebar();
    }
  } catch (error) {
    console.error('Error executing command:', error);
    terminal.terminal.writeln(`\r\nError: Unable to execute command.`);
  } finally {
    if (isInstallCommand) {
      setTerminals(prevTerminals =>
        prevTerminals.map(t =>
          t.id === terminalId ? { ...t, isInstalling: false } : t
        )
      );
      terminal.terminal.write('\x1b[?25h'); // Show cursor
    }
  }

  terminal.terminal.write(`\r\n${terminal.currentDirectory}> `);
};

// ... (rest of the component remains the same)

  const closeTerminal = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setTerminals(prevTerminals => {
      const updatedTerminals = prevTerminals.filter(t => t.id !== id);
      if (updatedTerminals.length === 0) {
        setTimeout(createNewTerminal, 0);
      } else if (activeTerminal === id) {
        setActiveTerminal(updatedTerminals[updatedTerminals.length - 1].id);
      }
      return updatedTerminals;
    });
  };

  const switchActiveTerminal = (id: number) => {
    setActiveTerminal(id);
  };

  return (
    <div style={{ display: 'flex', height: '300px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ width: '100%', borderBottom: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#000', color: '#fff' }}>
          <div style={{ padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'PROBLEMS' ? '2px solid orange' : 'none' }} onClick={() => setActiveTab('PROBLEMS')}>PROBLEMS</div>
          <div style={{ padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'OUTPUT' ? '2px solid orange' : 'none' }} onClick={() => setActiveTab('OUTPUT')}>OUTPUT</div>
          <div style={{ padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'DEBUG CONSOLE' ? '2px solid orange' : 'none' }} onClick={() => setActiveTab('DEBUG CONSOLE')}>DEBUG CONSOLE</div>
          <div style={{ padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'TERMINAL' ? '2px solid orange' : 'none' }} onClick={() => setActiveTab('TERMINAL')}>TERMINAL</div>
          <div style={{ padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'PORTS' ? '2px solid orange' : 'none' }} onClick={() => setActiveTab('PORTS')}>PORTS</div>
        </div>
        {activeTab === 'TERMINAL' && (
          <div style={{ flex: 1, position: 'relative', width: '100%' }}>
            <div ref={terminalContainerRef} style={{ height: '100%', width: '100%' }}>
              {terminals.map((term) => (
                <div
                  key={term.id}
                  id={`terminal-${term.id}`}
                  style={{
                    height: '100%',
                    width: '100%',
                    display: term.id === activeTerminal ? 'block' : 'none',
                    position: 'relative',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ width: '200px', borderLeft: '1px solid #ccc', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <button
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
          onClick={createNewTerminal}
        >
          +
        </button>
        {terminals.map((term) => (
          <div
            key={term.id}
            style={{
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: term.id === activeTerminal ? '#e0e0e0' : 'transparent',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #ccc',
            }}
            onClick={() => switchActiveTerminal(term.id)}
          >
            <div>Terminal</div>
            <button
              onClick={(e) => closeTerminal(term.id, e)}
              style={{
                background: 'none',
                border: 'none',
                color: 'red',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default XTermTerminal;