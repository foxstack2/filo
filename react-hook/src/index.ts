import { MessageClient } from "@foxstack/filo/dist/frontend"
import { useEffect, useState } from "react"

export function useMessageClient<MessageType>(
  extensionId: string,
  hubName: string,
  echoMessage: boolean = false
): [MessageClient<MessageType>] {
  function createClient() {
    return new MessageClient<MessageType>({
      extensionId: extensionId,
      name: hubName,
      echoMessage: echoMessage
    })
  }

  let [client, setClient] = useState(createClient)

  useEffect(() => {
    client.connect()

    // When the client is disconnected, just create a new client.
    let onDisconnect = (_port: chrome.runtime.Port) => {
      setClient(createClient())
    }
    client.onDisconnect(onDisconnect)

    return () => {
      client.removeOnDisconnectListener(onDisconnect)
    }
  }, [client])

  return [client]
}
