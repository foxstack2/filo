import { AllMessageHub, MessageHandler } from "@foxstack/filo/dist/background"

import { demoHubName, type DemoMessage } from "~config"

function main() {
  let allHub = new AllMessageHub()

  console.info("Running background main.")
  const messageHandler = new MessageHandler<DemoMessage>()
  allHub.registerMessageHandler(demoHubName, messageHandler)

  messageHandler.onMessage((message, tags) => {
    console.log(message)
  })
}

main()
