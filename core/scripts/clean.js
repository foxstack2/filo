import { rm } from "node:fs/promises"
import path from "node:path"
import { packageDirectory } from "pkg-dir"

async function main() {
  let packageDir = await packageDirectory()

  if (!packageDir) {
    console.error("The package root (core) can't be found.")
    return
  }

  let distPath = path.join(packageDir, "dist")

  try {
    await rm(distPath, { recursive: true })
    console.info("<package root>/dist directory has been deleted.")
  } catch (e) {
    if (e.errno === -4058) {
      console.log("<package root>/dist is already deleted.")
    } else {
      throw e
    }
  }
}

await main()
