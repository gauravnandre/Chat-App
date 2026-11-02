
import React, { useContext, useState, useEffect } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext.jsx'
import { AuthContext } from '../../context/authContext.jsx'

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)

  const [msgImages, setmsgImages] = useState([])

  useEffect(() => {
    setmsgImages(
      messages.filter(msg => msg.image).map(msg => msg.image)
    )
  }, [messages])

  if (!selectedUser) return null

  return (
    <div className="hidden md:flex flex-col bg-[#8185B2]/10 text-white h-full min-h-0 overflow-hidden">

      {/* User Information */}
      <div className="pt-16 pb-4 flex flex-col items-center gap-2 text-xs font-light shrink-0">

        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 h-20 rounded-full object-cover"
        />

        <h1 className="px-5 text-xl font-medium flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}

          {selectedUser.fullName}
        </h1>

        <p className="px-5 text-center">
          {selectedUser.bio}
        </p>

      </div>

      <hr className="border-[#ffffff50] my-4 shrink-0" />

      {/* Media */}
      <div className="px-5 text-xs flex-1 min-h-0 overflow-y-auto">

        <p>Media</p>

        <div className="mt-3 grid grid-cols-2 gap-3">

          {msgImages.map((url, index) => (
            <div
              key={index}
              onClick={() => window.open(url, '_blank')}
              className="cursor-pointer rounded"
            >
              <img
                src={url}
                alt=""
                className="w-full aspect-square object-cover rounded-md"
              />
            </div>
          ))}

        </div>

      </div>

      {/* Logout */}
      <div className="p-5 shrink-0">
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm py-3 rounded-full hover:opacity-90"
        >
          Logout
        </button>
      </div>

    </div>
  )
}

export default RightSidebar
