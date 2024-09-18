import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import EditorArea from './EditorArea'
import Terminal from './Terminal'
import '../styles/Editor.css'

const Editor: React.FC = () => {
  const [activeIcon, setActiveIcon] = useState<string | null>('files')

  return (
    <div className="editor">
      <Header />
      <div className="main-content">
        <Sidebar setActiveIcon={setActiveIcon} />
        <EditorArea activeIcon={activeIcon} />
      </div>
      <Terminal />
    </div>
  )
}

export default Editor