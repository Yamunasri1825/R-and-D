import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Icons from './components/Icons';
import GitHubRepo from './components/GitHubRepo';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import './App.css';
import axios from 'axios';
import XTermTerminal from './components/XTernTerminal'; // Import the terminal component

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
  const [sidebarView, setSidebarView] = useState<'files' | 'github' | null>(null);
  const [changedFiles, setChangedFiles] = useState<File[]>([]);
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [commitMessage, setCommitMessage] = useState<string>('Initial commit');

  useEffect(() => {
    const storedFolders = localStorage.getItem('folders');
    if (storedFolders) {
      const parsedFolders = JSON.parse(storedFolders);
      setFolders(parsedFolders);
      const allFiles = getAllFiles(parsedFolders);
      setOriginalFiles(allFiles);
    }
  }, []);

  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem('folders', JSON.stringify(folders));
    }
  }, [folders]);

  const getAllFiles = (folders: Folder[]): File[] => {
    let files: File[] = [];
    folders.forEach(folder => {
      files = [...files, ...folder.files];
      files = [...files, ...getAllFiles(folder.folders)];
    });
    return files;
  };

  const loadFileContent = async (fileId: string) => {
    try {
      const response = await axios.get(`http://localhost:5002/files/${fileId}`);
      if (response.data.content) {
        setCode(response.data.content);
      }
      if (response.data.name) {
        setFileName(response.data.name);
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
      const updatedFile = { ...currentFile, content: newCode };
      setCurrentFile(updatedFile);
      setCode(newCode);
  
      const updateFoldersWithCode = (folders: Folder[]): Folder[] => {
        return folders.map(folder => ({
          ...folder,
          files: folder.files.map(file =>
            file.id === updatedFile.id ? updatedFile : file
          ),
          folders: updateFoldersWithCode(folder.folders),
        }));
      };
  
      const updatedFolders = updateFoldersWithCode(folders);
      setFolders(updatedFolders);
  
      const originalFile = originalFiles.find(f => f.id === updatedFile.id);
      
      if (originalFile && originalFile.content !== newCode) {
        setChangedFiles(prevChangedFiles => {
          const updatedChangedFiles = prevChangedFiles.some(f => f.id === updatedFile.id)
            ? prevChangedFiles.map(f => f.id === updatedFile.id ? updatedFile : f)
            : [...prevChangedFiles, updatedFile];
          return updatedChangedFiles;
        });
      } else {
        setChangedFiles(prevChangedFiles => {
          const filteredChangedFiles = prevChangedFiles.filter(f => f.id !== updatedFile.id);
          return filteredChangedFiles;
        });
      }
  
      localStorage.setItem('folders', JSON.stringify(updatedFolders));
    }
  };

  const handleSelectRepo = (repoName: string) => {
    setSelectedRepo(repoName);
    
    if (!folders.find(folder => folder.name === repoName)) {
      const newFolder = { name: repoName, files: [], folders: [] };
      setFolders(prevFolders => {
        const updatedFolders = [...prevFolders, newFolder];
        localStorage.setItem('folders', JSON.stringify(updatedFolders));
        return updatedFolders;
      });
    }
  };

  const toggleTerminal = () => {
    setIsTerminalVisible(prev => !prev);
  };

  const toggleFilesSidebar = () => {
    setSidebarView(prev => prev === 'files' ? null : 'files');
  };

  const toggleGitHubSidebar = () => {
    setSidebarView(prev => prev === 'github' ? null : 'github');
  };

  const handleCreateFolder = (parentFolderName: string, folderName: string) => {
    if (!folderName) {
      alert("Folder name cannot be empty");
      return;
    }

    setFolders(prevFolders => {
      const newFolder = { name: folderName, files: [], folders: [] };
      if (parentFolderName === '') {
        return [...prevFolders, newFolder];
      }
      const updateFolders = (folders: Folder[]): Folder[] => {
        return folders.map(folder => {
          if (folder.name === parentFolderName) {
            return { ...folder, folders: [...folder.folders, newFolder] };
          }
          return { ...folder, folders: updateFolders(folder.folders) };
        });
      };
      return updateFolders(prevFolders);
    });
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

    const updatedFolders = updateFolders(folders);
    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
    setCurrentFile(newFile);
    setCode('');
    setFileName(fileName);
  };

  const handleOpenFile = (file: File) => {
    setCurrentFile(file);
    setCode(file.content);
    setFileName(file.name);
    
    if (!selectedRepo) {
      const repoName = folders.find(folder => 
        folder.files.some(f => f.id === file.id) || 
        folder.folders.some(subFolder => subFolder.files.some(f => f.id === file.id))
      )?.name;
      if (repoName) {
        setSelectedRepo(repoName);
      }
    }

    setSidebarView('files');
  };

  const handleSaveFile = async () => {
    if (currentFile) {
      try {
        await axios.post(`http://localhost:5002/files/${currentFile.id}`, {
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
    <>
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
        <Icons onFileClick={toggleFilesSidebar} onGitHubClick={toggleGitHubSidebar} />

        {sidebarView && (
          <div className="sidebar-container">
            {sidebarView === 'files' && (
              <Sidebar 
                folders={folders} 
                onCreateFolder={handleCreateFolder}
                onCreateFile={handleCreateFile}
                onOpenFile={handleOpenFile} 
                repoName={selectedRepo || ''}
                onFileOpen={(content, language) => {
                  setCode(content);
                }}
              />
            )}
            {sidebarView === 'github' && (
              <GitHubRepo 
                onCreateFolder={handleSelectRepo} 
                folders={folders}
                changedFiles={changedFiles}
                setChangedFiles={setChangedFiles}
                selectedRepo={selectedRepo}
                setSelectedRepo={setSelectedRepo}
                commitMessage={commitMessage}
                setCommitMessage={setCommitMessage}
              />
            )}
          </div>
        )}

        <div className="content">
          {currentFile && (
            <div className="editor-layout">
              {currentFile.name.endsWith('.html') ? (
                <LivePreview 
                  htmlContent={currentFile.content}
                  setHtmlContent={(newContent) => handleUpdateCode(newContent)}
                />
              ) : (
                <CodeEditor 
                  code={code}
                  fileName={fileName}
                  onUpdateCode={handleUpdateCode}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="footer">
        {isTerminalVisible && (
          <XTermTerminal 
            onUpdateSidebar={() => {
              // Implement sidebar update logic here
              // For example, refresh folder structure
            }}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default App;
