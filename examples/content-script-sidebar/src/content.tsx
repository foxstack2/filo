import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

import { ChatCard } from "~features/chat-card"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  return (
    <div className="z-50 flex fixed top-32 right-8">
      <ChatCard
        className="w-[500px]"
        sendTo="side panel"
        color="red"></ChatCard>
    </div>
  )
}

export default PlasmoOverlay
