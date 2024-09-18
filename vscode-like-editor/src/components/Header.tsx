import React from 'react'
import '../styles/Header.css'

const Header: React.FC = () => {
  return (
    <div className="header">
      <div className="header-title">VS Code-like Editor</div>
      <input className="header-search" type="text" placeholder="Search..." />
    </div>
  )
}

export default Header