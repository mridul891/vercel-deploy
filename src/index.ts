import { commandOptions, createClient } from "redis";
import { copyFullDir, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

async function main() {
  while (1) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    const id = response?.element;
    await downloadS3Folder(`output/${id}`);
    console.log("Downloaded all the files")
    await buildProject(id)
    console.log("Build the project")
    await copyFullDir(id)
    console.log("Copy all the react file to the dir")
  }
}
main();
