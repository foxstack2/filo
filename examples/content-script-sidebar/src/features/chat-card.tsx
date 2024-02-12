import { useMessage, useMessageClient } from "@foxstack/filo-react-hook"
import { Button, Card, TextInput } from "flowbite-react"
import { useEffect, useReducer, useState } from "react"

import { demoHubName, extensionId, type DemoMessage } from "~config"

export function ChatCard({
  className,
  sendTo,
  color
}: {
  className?: string
  sendTo: string
  color: "red" | "black"
}) {
  const [client] = useMessageClient<DemoMessage>(extensionId, demoHubName, true)

  const [message, setMessage] = useState("LOL!")

  const [messageHistory, addToHistory] = useReducer(
    (prevState: DemoMessage[], action: DemoMessage) => {
      return prevState.concat(action)
    },
    [] as DemoMessage[]
  )

  const [messageReceived, _messageTagsReceived] = useMessage(client)

  useEffect(() => {
    let f = (msg: DemoMessage, _tags: any) => {
      addToHistory(msg)
    }
    client.onMessage(f)

    return () => {
      client.removeOnMessageListener(f)
    }
  }, [client])

  const buttonClick = () => {
    if (!message) return
    client.sendMessage({ msg: message, color: color })
    setMessage("")
  }

  return (
    <Card className={className}>
      <h2>Demo Chat</h2>
      <p>Current message received: {messageReceived?.msg}</p>
      <MessageArea messages={messageHistory}></MessageArea>
      <form className="flex flex-col gap-4">
        <TextInput
          placeholder="Write some text here"
          onChange={(e) => {
            setMessage(e.target.value)
          }}
          value={message}></TextInput>
        <Button onClick={buttonClick}>Send to {sendTo}</Button>
      </form>
    </Card>
  )
}

function MessageArea({
  className,
  messages
}: {
  className?: string
  messages: { msg: string; color: "red" | "black" }[]
}) {
  const Lines = () => {
    let result = []
    messages.forEach((message, index) => {
      let { msg, color } = message
      result.push(
        <p
          key={index}
          className={color == "red" ? "text-red-600" : "text-black"}>
          {msg}
        </p>
      )
    })
    return result
  }

  return (
    <div
      className={`border-2 border-blue-600 p-4 h-[400px] rounded-lg ${className}`}>
      <Lines></Lines>
    </div>
  )
}
