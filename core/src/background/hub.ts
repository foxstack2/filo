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
    handler: IMessageHandler
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
  private readonly _portInfoStorage = new PortInfoStorage()
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
      let portInfo = new PortInfo(port, message.echoMessage)
      this._portInfoStorage.addPortInfo(clientId, portInfo)

      // Register messages handler.
      port.onMessage.addListener((message, _) => {
        this.handleMessage(portInfo, message)
      })

      port.onDisconnect.addListener((port) => this.handleDisconnect(port))
    }

    port.onMessage.addListener(f)
  }

  public registerMessageHandler<MessageType>(handler: IMessageHandler) {
    this._message_handler = handler
  }

  private handleMessage(sender: PortInfo, message: any) {
    this._message_handler.handleMessage(this._portInfoStorage, sender, message)
  }

  private handleDisconnect(port: chrome.runtime.Port) {
    this._portInfoStorage.removePortInfoByPort(port)
  }
}

class PortInfo {
  public readonly port: chrome.runtime.Port
  public readonly echoMessage: boolean

  constructor(port: chrome.runtime.Port, echoMessage: boolean) {
    this.port = port
    this.echoMessage = echoMessage
  }
}

class PortInfoStorage {
  private readonly _uuid_port_infos: Map<string, PortInfo> = new Map()
  private readonly _port_uuids: Map<chrome.runtime.Port, string> = new Map()

  public addPortInfo(clientId: string, portInfo: PortInfo) {
    this._uuid_port_infos.set(clientId, portInfo)
    this._port_uuids.set(portInfo.port, clientId)
  }

  public removePortInfoByPort(port: chrome.runtime.Port) {
    let portUUID = this._port_uuids.get(port)
    console.assert(portUUID)
    this._uuid_port_infos.delete(portUUID!)
    this._port_uuids.delete(port)
  }

  public *entries() {
    yield* this._uuid_port_infos.entries()
  }
}

interface IMessageHandler {
  handleMessage(
    storage: PortInfoStorage,
    sender: PortInfo,
    portMessage: any
  ): void
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

  public handleMessage(
    storage: PortInfoStorage,
    sender: PortInfo,
    portMessage: any
  ) {
    let _portMessage = portMessage as PortMessage<MessageType>
    let { message, tags } = _portMessage

    this._handlers.forEach((f) => f(message, tags))
  }
}

export class BroadcastMessageHandler<MessageType> implements IMessageHandler {
  // Broadcast the message to all clients in the current hub.
  public handleMessage(
    storage: PortInfoStorage,
    sender: PortInfo,
    portMessage: any
  ): void {
    let _portMessage = portMessage as PortMessage<MessageType>

    // Iterate through all matched port to broadcast the message.
    for (const [clientId, to] of storage.entries()) {
      if (!this.senderGuard(sender, to)) continue
      to.port.postMessage(_portMessage)
    }
  }

  // Decide whether the message can be sent to the sender (if the sender matched other conditions).
  private senderGuard(sender: PortInfo, to: PortInfo): boolean {
    return sender != to || sender.echoMessage
  }
}
