
import React, { useContext, useState, useEffect } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/authContext.jsx'
import { ChatContext } from '../../context/ChatContext.jsx'

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setselectedUser,
    unseenMessages,
    setunseenMessages
  } = useContext(ChatContext)

  const { logout, onlineUsers } = useContext(AuthContext)

  const [input, setinput] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = useNavigate()

  const filteredUsers = input
    ? users.filter(user =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users

  useEffect(() => {
    getUsers()
  }, [onlineUsers])

  return (
    <div
      className={`bg-[#8185B2]/10 h-full min-h-0 p-4 sm:p-5 overflow-y-auto text-white ${
        selectedUser ? 'max-md:hidden' : ''
      }`}
    >

      {/* Header */}
      <div className="pb-5">

        <div className="flex justify-between items-center">

          <img
            src={assets.logo}
            alt="Logo"
            className="max-w-36 sm:max-w-40"
          />

          <div className="relative">

            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <img
                src={assets.menu_icon}
                alt="Menu"
                className="w-5 h-5 cursor-pointer"
              />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 z-50 w-36 rounded-lg bg-[#282142] border border-gray-600 shadow-xl overflow-hidden">

                <button
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/profile')
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-white/10"
                >
                  Edit Profile
                </button>

                <hr className="border-gray-600" />

                <button
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-white/10"
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        {/* Search */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">

          <img
            src={assets.search_icon}
            alt="Search"
            className="w-3"
          />

          <input
            onChange={e => setinput(e.target.value)}
            value={input}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1 min-w-0"
            placeholder="Search User"
          />

        </div>

      </div>

      {/* User List */}
      <div className="flex flex-col">

        {filteredUsers.map(client => (

          <div
            onClick={() => {
              setselectedUser(client)
              setunseenMessages(prev => ({
                ...prev,
                [client._id]: 0
              }))
              setMenuOpen(false)
            }}
            key={client._id}
            className={`relative flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 ${
              selectedUser?._id === client._id
                ? 'bg-[#282142]/50'
                : ''
            }`}
          >

            <img
              src={client?.profilePic || assets.avatar_icon}
              alt=""
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />

            <div className="flex flex-col leading-5 min-w-0">
              <p className="truncate">{client.fullName}</p>

              {onlineUsers.includes(client._id) ? (
                <span className="text-green-400 text-xs">
                  Online
                </span>
              ) : (
                <span className="text-neutral-400 text-xs">
                  Offline
                </span>
              )}
            </div>

            {unseenMessages[client._id] > 0 && (
              <p className="ml-auto shrink-0 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[client._id]}
              </p>
            )}

          </div>

        ))}

      </div>

    </div>
  )
}

export default Sidebar
