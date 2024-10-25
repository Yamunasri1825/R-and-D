
import React, { useState, useEffect } from 'react';
import { FaFolder, FaFolderPlus, FaFileMedical, FaFile, FaUpload } from 'react-icons/fa';
import { Folder, File } from './types';
import '../styles/Sidebar.css';

interface SidebarProps {
  folders: Folder[];
  onCreateFolder: (parentFolderName: string, folderName: string) => void;
  onCreateFile: (parentFolderName: string, fileName: string) => void;
  onOpenFile: (file: File) => void;
  onFileOpen: (fileContent: string, fileLanguage: string) => void;
  repoName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  folders, 
  onCreateFolder, 
  onCreateFile, 
  onOpenFile, 
  onFileOpen,
  repoName
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
  const [initialFolderCreated, setInitialFolderCreated] = useState(false);

  useEffect(() => {
    console.log("Sidebar received folders:", folders);
    console.log("Sidebar received repoName:", repoName);
    if (folders.length === 0 && repoName && !initialFolderCreated) {
      console.log("Creating initial folder for repo:", repoName);
      onCreateFolder('', repoName);
      setInitialFolderCreated(true);
    }
  }, [folders, repoName, onCreateFolder, initialFolderCreated]);

  // On component mount, check for a saved file in localStorage and open it
  useEffect(() => {
    const savedFile = localStorage.getItem('openedFile');
    if (savedFile) {
      const { content, language } = JSON.parse(savedFile);
      onFileOpen(content, language); // Open file in the editor with saved content and language
    }
  }, [onFileOpen]);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  const handleCreateFolder = (parentFolderName: string) => {
    const folderName = prompt('Enter new folder name:');
    if (folderName) {
      onCreateFolder(parentFolderName, folderName);
    }
  };

  const handleCreateFile = (parentFolderName: string) => {
    const fileName = prompt('Enter new file name:');
    if (fileName) {
      onCreateFile(parentFolderName, fileName);
    }
  };

  const handleOpenFile = (file: File) => {
    onOpenFile(file);
    onFileOpen(file.content, file.language);

    // Store the opened file details in localStorage
    localStorage.setItem(
      'openedFile',
      JSON.stringify({
        name: file.name,
        content: file.content,
        language: file.language,
      })
    );
  };

  const handleChooseFile = (event: React.ChangeEvent<HTMLInputElement>, folderName: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileExtension = file.name.split('.').pop();
        const language =
          fileExtension === 'js'
            ? 'javascript'
            : fileExtension === 'html'
            ? 'html'
            : fileExtension === 'css'
            ? 'css'
            : 'text'; // Extend to handle more file types

        const newFile: File = {
          id: Math.random().toString(36).substr(2, 9), // Generate unique ID for each file
          name: file.name,
          content,
          language,
        };

        // Add the new file to the specific folder's uploaded files
        setUploadedFiles((prev) => ({
          ...prev,
          [folderName]: prev[folderName] ? [...prev[folderName], newFile] : [newFile],
        }));

        // Open the file in the editor
        onFileOpen(content, language);

        // Store the opened file details in localStorage
        localStorage.setItem(
          'openedFile',
          JSON.stringify({
            name: newFile.name,
            content: newFile.content,
            language: newFile.language,
          })
        );
      };
      reader.readAsText(file);
    }
  };

  const renderFolderContents = (folder: Folder, depth = 0) => {
    return (
      <div key={folder.name} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="folder-item">
          <span onClick={() => toggleFolder(folder.name)}>
            <FaFolder /> {folder.name}
          </span>
          <div className="folder-actions">
            <FaFolderPlus onClick={() => handleCreateFolder(folder.name)} />
            <FaFileMedical onClick={() => handleCreateFile(folder.name)} />
            <label className="file-upload">
              <FaUpload />
              <input type="file" onChange={(e) => handleChooseFile(e, folder.name)} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        {expandedFolders.has(folder.name) && (
          <div>
            <ul>
              {folder.files.map((file) => (
                <li key={file.id} className="file-item" onClick={() => handleOpenFile(file)}>
                  <FaFile /> {file.name}
                </li>
              ))}
              {uploadedFiles[folder.name]?.map((file) => (
                <li key={file.id} className="file-item" onClick={() => handleOpenFile(file)}>
                  <FaFile /> {file.name}
                </li>
              ))}
            </ul>
            {folder.folders.map((subFolder) => renderFolderContents(subFolder, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sidebar">
      <div className="folders">
        {folders.map((folder) => renderFolderContents(folder))}
      </div>
    </div>
  );
};

export default Sidebar;
