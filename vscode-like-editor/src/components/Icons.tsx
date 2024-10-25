import React, { useState } from 'react';
import { FaFileAlt, FaSearch, FaPuzzlePiece, FaPlay, FaGithub } from 'react-icons/fa';
import GitHubRepo from './GitHubRepo';
import './Icons.css'
interface IconsProps {
  onFileClick: () => void;
  onGitHubClick: () => void;
}

interface IconsProps {
  onFileClick: () => void;
  onGitHubClick: () => void;
}

const Icons: React.FC<IconsProps> = ({ onFileClick, onGitHubClick }) => {
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
        <li onClick={onGitHubClick}>
          <FaGithub title="GitHub" />
        </li>
      </ul>
    </div>
  );
};

export default Icons;
