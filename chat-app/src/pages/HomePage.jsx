
import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext.jsx'

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext)

  return (
    <div className="w-full h-dvh min-h-0 sm:px-[5%] sm:py-[3%]">
      <div
        className={`w-full h-full min-h-0 backdrop-blur-xl border-gray-600 sm:border-2 sm:rounded-2xl overflow-hidden grid grid-cols-1 relative
        ${
          selectedUser
            ? 'md:grid-cols-[1fr_1.5fr_1fr]'
            : 'md:grid-cols-2'
        }`}
      >
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  )
}

export default HomePage
