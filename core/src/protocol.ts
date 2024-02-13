export interface MessageClientOptions {
  extensionId: string
  // The hub name.
  name: string
  //
  echoMessage: boolean
}

export class SenderMeta {
  clientId: string
  // Set to zero if not suitable.
  tabId: number

  constructor(clientId: string, tabId: number) {
    this.clientId = clientId
    this.tabId = tabId
  }
}

// interface MessageTags {
//     standard: { senderMeta: { clientId: string } }
// }

export class MessageTags {
  public standard: { senderMeta: SenderMeta }

  constructor(senderMeta: SenderMeta) {
    this.standard = { senderMeta: senderMeta }
  }
}

export interface PortMessage<MessageType> {
  message: MessageType
  tags: MessageTags
}

export interface FirstMessage {
  senderMeta: SenderMeta
  echoMessage: boolean
}
