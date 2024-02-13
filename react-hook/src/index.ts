import { MessageClient } from "@foxstack/filo/dist/frontend"
import { MessageTags } from "@foxstack/filo/dist/protocol"
import { useEffect, useState } from "react"

/**
 * Creates and returns a message client with the given extension ID, hub name, and echo message flag.
 * The message client is connected upon creation and automatically reconnects when disconnected.
 *
 * @template MessageType
 * @param {string} extensionId - The ID of the extension that the message client belongs to.
 * @param {string} hubName - The name of the message hub that the client connects to.
 * @param {boolean} [echoMessage=false] - Specifies whether the message client would receive the message it sent.
 * @return {[MessageClient<MessageType>]} An array containing the message client.
 */
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
    // When the client is disconnected, just create a new client.
    let onDisconnect = (_port: chrome.runtime.Port) => {
      setClient(createClient())
    }

    ;(async function () {
      await client.connect()
      client.onDisconnect(onDisconnect)
    })()

    return () => {
      client.removeOnDisconnectListener(onDisconnect)
    }
  }, [client])

  return [client]
}

/**
 * This hook sets up a listener for messages received from the provided message client.
 * When a new message is received, the hook updates the state with the received message and its tags.
 * The hook returns an array containing the received message and its tags.
 *
 * @template MessageType
 * @param {MessageClient<MessageType>} client - The message client instance to listen to.
 * @returns {[MessageType | undefined, MessageTags | undefined]} - An array containing the received message and its tags.
 */
export function useMessage<MessageType>(
  client: MessageClient<MessageType>
): [MessageType | undefined, MessageTags | undefined] {
  const [message, setMessage] = useState<MessageType>()
  const [messageTags, setMessageTags] = useState<MessageTags>()

  useEffect(() => {
    if (!client) return

    let f = (message: MessageType, tags: MessageTags) => {
      // handle the received message
      setMessage(message)
      setMessageTags(tags)
    }

    client.onMessage(f)
    return () => client.removeOnMessageListener(f)
  }, [client])

  return [message, messageTags]
}
