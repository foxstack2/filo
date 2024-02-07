import { useMessageClient } from "@foxstack/filo-react-hook"
import cssText from "data-text:~style.css"
import { Button } from "flowbite-react"
import type { PlasmoCSConfig } from "plasmo"
import { useReducer } from "react"

import { demoHubName, extensionId, type DemoMessage } from "~config"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [count, increase] = useReducer((c) => c + 1, 0)
  const [client] = useMessageClient<DemoMessage>(extensionId, demoHubName)

  return (
    <div className="z-50 flex fixed top-32 right-8">
      <Button
        onClick={() => {
          increase()
          client.sendMessage({ num: count })
        }}>
        Send Message "{count}"
      </Button>
    </div>
  )
}

export default PlasmoOverlay
