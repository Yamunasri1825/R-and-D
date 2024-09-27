import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Icons from './components/Icons';
import GitHubRepo from './components/GitHubRepo';
import Terminal from './components/Terminal';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import './App.css';
import axios from 'axios';

interface File {
  id: string;
  name: string;
  content: string;
}

interface Folder {
  name: string;
  files: File[];
  folders: Folder[];
}

const App: React.FC = () => {
  const [code, setCode] = useState<string>(''); // Code content
  const [fileName, setFileName] = useState<string>(''); // Current file name
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const loadFileContent = async (fileId: string) => {
    try {
      console.log('Fetching file content for ID:', fileId);
      const response = await axios.get(`http://localhost:5000/files/${fileId}`);
      console.log('File content loaded:', response.data.content);
      if (response.data.content) {
        setCode(response.data.content); // Set code content
      }
      if (response.data.name) {
        setFileName(response.data.name); // Set file name
      }
    } catch (error) {
      console.error('Error loading file content:', error);
    }
  };

  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.content);
      setFileName(currentFile.name);
    }
  }, [currentFile]);

  const handleUpdateCode = (newCode: string) => {
    if (currentFile) {
      // Update code for the current file
      setCurrentFile({ ...currentFile, content: newCode });
      setCode(newCode);
    }
  };

  const handleSelectRepo = (repoName: string) => {
    setSelectedRepo(repoName);
    if (!folders.find(folder => folder.name === repoName)) {
      setFolders([...folders, { name: repoName, files: [], folders: [] }]);
    }
  };

  const toggleTerminal = () => {
    setIsTerminalVisible(prev => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const handleCreateFolder = (parentFolderName: string, folderName: string) => {
    if (!folderName) {
      alert("Folder name cannot be empty");
      return;
    }

    const updateFolders = (folders: Folder[]): Folder[] => {
      return folders.map(folder => {
        if (folder.name === parentFolderName) {
          return { 
            ...folder, 
            folders: [...folder.folders, { name: folderName, files: [], folders: [] }] 
          };
        }
        return { ...folder, folders: updateFolders(folder.folders) };
      });
    };

    setFolders(updateFolders(folders));
  };

  const handleCreateFile = (parentFolderName: string, fileName: string) => {
    if (!fileName) {
      alert("File name cannot be empty");
      return;
    }

    const newFile = { id: Date.now().toString(), name: fileName, content: '' };

    const updateFolders = (folders: Folder[]): Folder[] => {
      return folders.map(folder => {
        if (folder.name === parentFolderName) {
          return { ...folder, files: [...folder.files, newFile] };
        }
        return { ...folder, folders: updateFolders(folder.folders) };
      });
    };

    setFolders(updateFolders(folders));
    setCurrentFile(newFile); // Set the newly created file as the current file
    setCode(''); // Reset the code for the new file
    setFileName(fileName); // Set the file name for the new file
  };

  const handleOpenFile = (file: File) => {
    setCurrentFile(file);
    setCode(file.content); // Load content for the opened file
    setFileName(file.name); // Set the file name for the opened file
  };

  const handleSaveFile = async () => {
    if (currentFile) {
      console.log("Saving file:", currentFile.name);
      try {
        await axios.post(`http://localhost:5000/files/${currentFile.id}`, {
          name: currentFile.name,
          content: currentFile.content,
        });
        alert("File saved successfully!");
      } catch (error) {
        console.error('Error saving file:', error);
        alert("Error saving file.");
      }
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsMinimized(false);
    setIsMaximized(false);
    setSelectedRepo(null);
  };

  return (
    <div className="app">
      <Header 
        onNewFile={() => handleCreateFile(selectedRepo || "", "")} 
        onSaveFile={handleSaveFile} 
        onCloseWindow={handleClose} 
        onMinimize={handleMinimize} 
        onMaximize={handleMaximize} 
        onToggleTerminal={toggleTerminal} 
      />
      <div className={`main ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
        <Icons onFileClick={toggleSidebar} />

        {isSidebarVisible && (
          <Sidebar 
            folders={folders} 
            onCreateFolder={handleCreateFolder}
            onCreateFile={handleCreateFile}
            onOpenFile={handleOpenFile} 
          />
        )}

        <div className="content">
          {!selectedRepo ? (
            <GitHubRepo onCreateFolder={handleSelectRepo} />
          ) : (
            <div className="editor-layout">
              {currentFile && currentFile.name.endsWith('.html') ? (
                <LivePreview 
                  htmlContent={currentFile.content}
                  setHtmlContent={(newContent) => handleUpdateCode(newContent)}
                />
              ) : (
                currentFile && (
                  <CodeEditor 
                    code={code}
                    fileName={fileName}
                    onUpdateCode={handleUpdateCode}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
      <div className="footer">
        {isTerminalVisible && <Terminal />}
      </div>
    </div>
  );
};

export default App;
