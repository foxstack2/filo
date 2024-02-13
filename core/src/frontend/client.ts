import { v4 as uuidV4 } from "uuid"

import {
  FirstMessage,
  MessageClientOptions,
  MessageTags,
  PortMessage,
  SenderMeta
} from "../protocol.js"

export class MessageClient<MessageType> {
  private _connected: boolean = false
  private readonly _extensionId: string
  private readonly _name: string
  private readonly _echoMessage: boolean
  private readonly _clientId: string
  private _background: chrome.runtime.Port | undefined
  private readonly _onMessageListeners: Set<
    (message: MessageType, tags: MessageTags) => void
  >
  private _finalized: boolean = false
  private _messageHandler:
    | ((message: any, port: chrome.runtime.Port) => void)
    | undefined
  private _senderMeta: SenderMeta | undefined

  public constructor(options: MessageClientOptions) {
    this._extensionId = options.extensionId
    this._name = options.name
    this._echoMessage = options.echoMessage
    this._clientId = uuidV4()
    this._onMessageListeners = new Set()
  }

  public async connect() {
    if (this._connected) {
      throw "Already connected."
    }
    this.finalizedGuard()
    this._background = chrome.runtime.connect(this._extensionId, {
      name: this._name
    })
    this._messageHandler = (m: any, p: chrome.runtime.Port) =>
      this.messageHandler(m, p)
    this._background.onMessage.addListener(this._messageHandler!)
    let currentTabId = 0
    if (chrome && chrome.tabs) {
      let currentTab = await chrome.tabs.getCurrent()
      currentTabId = currentTab && currentTab.id ? currentTab.id : 0
    }
    this._senderMeta = new SenderMeta(this._clientId, currentTabId)
    this.sendFirstMessage({
      senderMeta: this._senderMeta,
      echoMessage: this._echoMessage
    })
    this._connected = true
  }

  private messageHandler(
    $message: PortMessage<MessageType>,
    _port: chrome.runtime.Port
  ) {
    let { message, tags } = $message
    this._onMessageListeners.forEach((f) => {
      f(message, tags)
    })
  }

  private finalizedGuard() {
    if (this._finalized) {
      throw "Current object has been finalized."
    }
  }

  private connectGuard() {
    if (!this._connected) {
      throw "The current client hasn't been connected to the background."
    }
  }

  public onMessage(f: (message: MessageType, tags: MessageTags) => void) {
    this.finalizedGuard()
    this._onMessageListeners.add(f)
  }

  public removeOnMessageListener(
    f: (message: MessageType, tags: MessageTags) => void
  ) {
    this.finalizedGuard()
    this._onMessageListeners.delete(f)
  }

  public sendMessage(message: MessageType) {
    this.finalizedGuard()
    this.connectGuard()
    let m: PortMessage<MessageType> = {
      message,
      tags: new MessageTags(this._senderMeta!)
    }
    this._background!.postMessage(m)
  }

  private sendFirstMessage(message: FirstMessage) {
    this._background!.postMessage(message)
  }

  private removeAllOnMessageListener() {
    this._onMessageListeners.clear()
    this._background!.onMessage.removeListener(this._messageHandler!)
  }

  public disconnect() {
    this.finalizedGuard()
    this._finalized = true
    this._connected = false
    this.removeAllOnMessageListener()
    this._background?.disconnect()
  }

  public onDisconnect(f: (port: chrome.runtime.Port) => void) {
    this.connectGuard()
    this.finalizedGuard()
    this._background!.onDisconnect.addListener(f)
  }

  public removeOnDisconnectListener(
    f: (message: any, port: chrome.runtime.Port) => void
  ) {
    this.connectGuard()
    this.finalizedGuard()
    this._background!.onMessage.removeListener(f)
  }
}
