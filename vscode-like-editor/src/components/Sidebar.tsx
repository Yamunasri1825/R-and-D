import React from 'react'
import { FaFile, FaSearch, FaGithub, FaBug } from 'react-icons/fa'
import { VscExtensions } from 'react-icons/vsc'
import '../styles/Sidebar.css'

interface SidebarProps {
  setActiveIcon: (icon: string) => void
}

type IconComponents = {
  [key: string]: React.ReactElement
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveIcon }) => {
  const iconComponents: IconComponents = {
    files: <FaFile />,
    search: <FaSearch />,
    git: <FaGithub />,
    debug: <FaBug />,
    extensions: <VscExtensions />
  }

  const icons = ['files', 'search', 'git', 'debug', 'extensions']

  return (
    <div className="sidebar">
      {icons.map((icon) => (
        <div
          key={icon}
          className="icon"
          onClick={() => setActiveIcon(icon)}
        >
          {iconComponents[icon]}
        </div>
      ))}
    </div>
  )
}

export default Sidebar