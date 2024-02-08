import cssText from "data-text:~style.css"
import { useEffect } from "react"

import { ChatCard } from "~features/chat-card"

const setStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  style.id = "tailwindcss-base-style"

  let head = document.getElementsByTagName("head")[0]

  head.appendChild(style)

  return () => {
    head.removeChild(style)
  }
}

export default function () {
  useEffect(() => {
    return setStyle()
  }, [])

  return (
    <div className="flex flex-col-reverse p-4 bg-neutral-100 h-screen w-screen justify-between">
      <ChatCard
        className="w-full"
        sendTo="content script"
        color="black"></ChatCard>
    </div>
  )
}
