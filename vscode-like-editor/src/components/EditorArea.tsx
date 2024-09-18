import React, { useState } from 'react';
import { FaPlus, FaSync, FaCopy } from 'react-icons/fa';
import CodeEditor from './CodeEditor';
import '../styles/EditArea.css';

interface EditorAreaProps {
  activeIcon: string | null;
}

const EditorArea: React.FC<EditorAreaProps> = ({ activeIcon }) => {
  const [files, setFiles] = useState<string[]>(['node_modules', 'src', 'package-lock.json', 'package.json']);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const handleCreateFile = () => {
    if (newFileName) {
      setFiles([...files, newFileName]);
      setNewFileName('');
      setShowInput(false);
    }
  };

  const handleFileClick = (file: string) => {
    setCurrentFile(file);
    setFileContent(`// Content of ${file}`); // Initialize with some content
  };

  const handleSaveFile = (content: string) => {
    console.log(`Saving content for ${currentFile}:`, content);
    // Here you can implement saving logic
  };

  const renderContent = () => {
    if (currentFile) {
      return (
        <CodeEditor fileName={currentFile} initialContent={fileContent} onSave={handleSaveFile} />
      );
    }

    switch (activeIcon) {
      case 'files':
        return (
          <div className="file-explorer">
            <div className="file-explorer-header">
              <span className="file-explorer-title">GIT_PROGRAMS</span>
              <div className="file-explorer-toolbar">
                <div className="toolbar-icon" onClick={() => setShowInput(true)}>
                  <FaPlus />
                </div>
                <div className="toolbar-icon">
                  <FaSync />
                </div>
                <div className="toolbar-icon">
                  <FaCopy />
                </div>
              </div>
            </div>
            {showInput && (
              <div className="file-input">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="New file name..."
                />
                <button onClick={handleCreateFile}>Create</button>
              </div>
            )}
            <div className="file-explorer-content">
              <ul>
                {files.map((file, index) => (
                  <li key={index} onClick={() => handleFileClick(file)}>
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'search':
        return <div>Search</div>;
      case 'git':
        return <div>Git</div>;
      case 'debug':
        return <div>Debug</div>;
      case 'extensions':
        return <div>Extensions</div>;
      default:
        return <p>Select an icon from the sidebar</p>;
    }
  };

  return (
    <div className="editor-area">
      {renderContent()}
    </div>
  );
};

export default EditorArea;