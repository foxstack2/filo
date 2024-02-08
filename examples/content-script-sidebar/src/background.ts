import * as console from "console"
import {
  AllMessageHub,
  BroadcastMessageHandler
} from "@foxstack/filo/dist/background"

import { demoHubName, type DemoMessage } from "~config"

function main() {
  console.log("Background is running.")

  let allHub = new AllMessageHub()
  let broadcastMessageHandler = new BroadcastMessageHandler<DemoMessage>()
  allHub.registerMessageHandler(demoHubName, broadcastMessageHandler)
}

main()
