import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaWindowMinimize, FaWindowMaximize, FaTimes } from 'react-icons/fa';
import '../styles/Header.css';

const Header: React.FC<{ 
  onNewFile: () => void; 
  onSaveFile: () => void; 
  onCloseWindow: () => void; 
  onMinimize: () => void; 
  onMaximize: () => void; 
  onToggleTerminal: () => void; // Add this prop
}> = ({ onNewFile, onSaveFile, onCloseWindow, onMinimize, onMaximize, onToggleTerminal }) => {
  const [isFileMenuOpen, setFileMenuOpen] = useState(false);

  const toggleFileMenu = () => {
    setFileMenuOpen(!isFileMenuOpen);
  };

  const handleNewTextFile = () => {
    onNewFile();
    setFileMenuOpen(false);
  };

  const handleSaveFile = () => {
    onSaveFile();
    setFileMenuOpen(false);
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-menu-item" onClick={toggleFileMenu}>
          File
        </div>
        {isFileMenuOpen && (
          <div className="file-dropdown">
            <div onClick={handleNewTextFile}>New Text File... Ctrl+N</div>
            <div>New File... Ctrl+Alt+Windows+N</div>
            <div>New Window... Ctrl+Shift+N</div>
            <div>Open File... Ctrl+O</div>
            <div>Open Folder... Ctrl+K Ctrl+O</div>
            <div>Open Workspace from File...</div>
            <div>Open Recent...</div>
            <div>Add Folder to Workspace...</div>
            <div onClick={handleSaveFile}>Save... Ctrl+S</div>
            <div>Save As... Ctrl+Shift+S</div>
            <div>Save All... Ctrl+K S</div>
            <div>Share...</div>
            <div>Auto Save</div>
            <div>Preferences...</div>
            <div>Revert File</div>
            <div>Close Editor... Ctrl+F4</div>
            <div>Close Folder... Ctrl+K F</div>
            <div onClick={onCloseWindow}>Close Window... Alt+F4</div>
            <div>Exit</div>
          </div>
        )}
        <div className="header-menu-item">Edit</div>
        <div className="header-menu-item">Selection</div>
        <div className="header-menu-item">View</div>
        <div className="header-menu-item">Go</div>
        <div className="header-menu-item">Run</div>
        <div className="header-menu-item" onClick={onToggleTerminal}>Terminal</div> {/* Add onClick handler */}
        <div className="header-menu-item">Help</div>
      </div>

      <div className="header-right">
        <span className="header-icon1"><FaChevronLeft size={18} /></span>
        <span className="header-icon2"><FaChevronRight size={18} /></span>
        <input className="header-search" type="text" placeholder="Search..." />
        <span className="header-search-icon"><FaSearch size={18} /></span>
        <span className="header-icon" onClick={onMinimize}><FaWindowMinimize size={18} /></span>
        <span className="header-icon" onClick={onMaximize}><FaWindowMaximize size={18} /></span>
        <span className="header-icon" onClick={onCloseWindow}><FaTimes size={18} /></span>
      </div>
    </div>
  );
};

export default Header;