import { FirstMessage, MessageTags, PortMessage } from "../protocol.js"

export class AllMessageHub {
  private readonly subHubs: Map<string, MessageHub>

  public constructor() {
    chrome.runtime.onConnect.addListener((port) => {
      this.handleConnect(port)
    })
    this.subHubs = new Map()
  }

  private handleConnect(port: chrome.runtime.Port) {
    let name = port.name

    // Get the correspondent hub to handle the connection.
    let subHub = this.getOrCreateHub(name)

    // Handle the new connection.
    subHub.handleConnect(port)
  }

  public registerMessageHandler<MessageType>(
    name: string,
    handler: MessageHandler<MessageType>
  ) {
    let hub = this.getOrCreateHub(name)

    hub.registerMessageHandler<MessageType>(handler)
  }

  private createHub(name: string): MessageHub {
    let hub = new MessageHub(name)
    this.subHubs.set(name, hub)
    return hub
  }

  private getOrCreateHub(name: string): MessageHub {
    let hub = this.subHubs.get(name)
    if (!hub) hub = this.createHub(name)
    return hub
  }
}

class MessageHub {
  private readonly _name: string
  private readonly _uuid_ports: Map<string, chrome.runtime.Port> = new Map()
  private readonly _port_uuids: Map<chrome.runtime.Port, string> = new Map()
  private _message_handler: IMessageHandler = new EmptyMessageHandler()

  public get name(): string {
    return this._name
  }

  public constructor(name: string) {
    this._name = name
  }

  public handleConnect(port: chrome.runtime.Port) {
    // Use one-time on-message handler to complete handshake.

    let f = (message: FirstMessage) => {
      // Remove the one-time setup listener.
      port.onMessage.removeListener(f)

      // Store the port for further usage.
      let { clientId } = message.senderMeta
      this._uuid_ports.set(clientId, port)
      this._port_uuids.set(port, clientId)

      // Register messages handler.
      port.onMessage.addListener((message, port) => this.handleMessage(message))

      port.onDisconnect.addListener((port) => this.handleDisconnect(port))
    }

    port.onMessage.addListener(f)
  }

  public registerMessageHandler<MessageType>(
    handler: MessageHandler<MessageType>
  ) {
    this._message_handler = handler
  }

  private handleMessage(message: any) {
    this._message_handler.handleMessage(message)
  }

  private handleDisconnect(port: chrome.runtime.Port) {
    let portUUID = this._port_uuids.get(port)
    this._uuid_ports.delete(portUUID!)
    this._port_uuids.delete(port)
  }
}

interface IMessageHandler {
  handleMessage(portMessage: any): void
}

class EmptyMessageHandler implements IMessageHandler {
  handleMessage(_: any) {}
}

export class MessageHandler<MessageType> implements IMessageHandler {
  private _handlers: Set<(message: MessageType, tags: MessageTags) => void> =
    new Set()

  public onMessage(
    callback: (message: MessageType, tags: MessageTags) => void
  ) {
    this._handlers.add(callback)
  }

  public removeOnMessageListener(
    callback: (message: MessageType, tags: MessageTags) => void
  ) {
    this._handlers.delete(callback)
  }

  public handleMessage(portMessage: any) {
    let _portMessage = portMessage as PortMessage<MessageType>
    let { message, tags } = _portMessage

    this._handlers.forEach((f) => f(message, tags))
  }
}
