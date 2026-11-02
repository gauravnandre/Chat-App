
import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext.jsx'
import { AuthContext } from '../../context/authContext.jsx'

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setselectedUser,
    sendMessage,
    getMessages
  } = useContext(ChatContext)

  const { authUser, onlineUsers, logout } = useContext(AuthContext)

  const scrollEnd = useRef()
  const [input, setinput] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    await sendMessage({ text: input.trim() })
    setinput('')
  }

  const handleSendImage = async (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ''
    }

    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return selectedUser ? (
    <div className="h-full min-h-0 flex flex-col relative overflow-hidden backdrop-blur-lg">

      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-stone-500 shrink-0">

        <button
          onClick={() => {
            setselectedUser(null)
            setMenuOpen(false)
          }}
          className="md:hidden p-1"
        >
          <img
            src={assets.arrow_icon}
            alt="Back"
            className="w-6"
          />
        </button>

        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-9 h-9 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <p className="text-white text-base font-medium truncate">
            {selectedUser.fullName}
          </p>

          <p className="text-xs text-gray-400">
            {onlineUsers.includes(selectedUser._id)
              ? 'Online'
              : 'Offline'}
          </p>
        </div>

        <img
          src={assets.help_icon}
          alt="Info"
          className="hidden md:block max-w-5"
        />

        {/* Mobile three-dot menu */}
        <div className="relative md:hidden">

          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="w-5 h-5"
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-36 rounded-lg bg-[#282142] border border-gray-600 shadow-xl">

              <button
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                }}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10"
              >
                Logout
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3">

        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`flex items-end gap-2 mb-5 ${
              msg.senderId !== authUser._id
                ? 'flex-row-reverse'
                : 'justify-end'
            }`}
          >

            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[70%] sm:max-w-[230px] rounded-lg border border-gray-700"
              />
            ) : (
              <p
                className={`p-2 max-w-[75%] md:max-w-[200px] text-sm font-light rounded-lg break-words text-white bg-violet-500/30 ${
                  msg.senderId === authUser._id
                    ? 'rounded-br-none'
                    : 'rounded-bl-none'
                }`}
              >
                {msg.text}
              </p>
            )}

            <div className="text-center text-xs shrink-0">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />

              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>

          </div>
        ))}

        <div ref={scrollEnd}></div>

      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 flex items-center gap-2 p-3 border-t border-white/10"
      >

        <div className="flex flex-1 min-w-0 items-center bg-gray-100/12 px-3 rounded-full">

          <input
            onChange={(e) => setinput(e.target.value)}
            value={input}
            type="text"
            placeholder="Send a message"
            className="flex-1 min-w-0 text-sm border-none py-3 outline-none text-white bg-transparent placeholder-gray-500"
          />

          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />

          <label htmlFor="image" className="cursor-pointer shrink-0">
            <img
              src={assets.gallery_icon}
              alt="Gallery"
              className="w-5"
            />
          </label>

        </div>

        <button type="submit" className="shrink-0">
          <img
            src={assets.send_button}
            alt="Send"
            className="w-7 cursor-pointer"
          />
        </button>

      </form>

    </div>
  ) : (
    <div className="hidden md:flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">
        Chat AnyTime, AnyWhere
      </p>
    </div>
  )
}

export default ChatContainer
