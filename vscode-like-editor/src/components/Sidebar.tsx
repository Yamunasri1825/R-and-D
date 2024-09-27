import React, { useState } from 'react';
import { FaFile, FaFolder, FaFolderPlus, FaFileMedical } from 'react-icons/fa';
import { File, Folder } from './types'; // Import shared types
import '../styles/Sidebar.css';

interface SidebarProps {
  folders: Folder[];
  onCreateFolder: (parentFolderName: string, folderName: string) => void;
  onCreateFile: (parentFolderName: string, fileName: string) => void;
  onOpenFile: (file: File) => void; // Use the imported File type
  onFileOpen: (fileContent: string, fileLanguage: string) => void; // New prop for opening files
}

const Sidebar: React.FC<SidebarProps> = ({ folders, onCreateFolder, onCreateFile, onOpenFile, onFileOpen }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => {
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
    onOpenFile(file); // Call the parent function to open the file
    // Call the function to open the file content and language
    onFileOpen(file.content, file.language); // Ensure the file object contains content and language
  };

  const renderFolders = (folders: Folder[], depth = 0) => {
    return folders.map((folder) => (
      <div key={folder.name} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="folder-item">
          <span onClick={() => toggleFolder(folder.name)}>
            <FaFolder /> {folder.name}
          </span>
          <div className="folder-actions">
            <FaFolderPlus onClick={() => handleCreateFolder(folder.name)} />
            <FaFileMedical onClick={() => handleCreateFile(folder.name)} />
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
            </ul>
            {renderFolders(folder.folders, depth + 1)} {/* Render subfolders recursively */}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="sidebar">
      <div className="folders">
        {renderFolders(folders)}
      </div>
    </div>
  );
};

export default Sidebar;
