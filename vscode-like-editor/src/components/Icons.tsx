import React, { useState } from 'react';
import { FaFileAlt, FaSearch, FaPuzzlePiece, FaPlay, FaGithub } from 'react-icons/fa';
import GitHubRepo from './GitHubRepo';

interface IconsProps {
  onFileClick: () => void;
}

const Icons: React.FC<IconsProps> = ({ onFileClick }) => {
  const [showGitHubRepo, setShowGitHubRepo] = useState(false);

  const handleGitHubClick = () => {
    setShowGitHubRepo(!showGitHubRepo); // Toggle the GitHubRepo view
  };

  // Function to handle creating a folder when a repo is selected
  const handleCreateFolder = (folderName: string) => {
    console.log(`Creating folder: ${folderName}`);
  };

  return (
    <div className="icons">
      <ul>
        <li onClick={onFileClick}>
          <FaFileAlt title="File" />
        </li>
        <li>
          <FaSearch title="Search" />
        </li>
        <li>
          <FaPuzzlePiece title="Extensions" />
        </li>
        <li>
          <FaPlay title="Run and Debug" />
        </li>
        <li onClick={handleGitHubClick}>
          <FaGithub title="GitHub" />
        </li>
      </ul>

      {showGitHubRepo && (
        <GitHubRepo onCreateFolder={handleCreateFolder} /> // Pass the folder creation logic here
      )}
    </div>
  );
};

export default Icons;
