import { MessageClient } from "@foxstack/filo/dist/frontend"
import { useEffect, useState } from "react"

export function useMessageClient<MessageType>(
  extensionId: string,
  hubName: string
): [MessageClient<MessageType>] {
  function createClient() {
    return new MessageClient<MessageType>({
      extensionId: extensionId,
      name: hubName,
      echoMessage: false
    })
  }

  let [client, setClient] = useState(createClient)

  useEffect(() => {
    client.connect()

    // When the client is disconnected, just create a new client.
    let onDisconnect = (port: chrome.runtime.Port) => {
      setClient(createClient())
    }
    client.onDisconnect(onDisconnect)

    return () => {
      client.removeOnDisconnectListener(onDisconnect)
    }
  }, [client])

  return [client]
}
