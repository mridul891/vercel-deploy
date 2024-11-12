import { exec } from "child_process";
import path from "path";

export const buildProject = async (id: string | undefined) => {
  return new Promise((resolve) => {
    console.log("reached");
    const child = exec(
      `cd ${path.join(
        __dirname,
        `output/${id}`
      )} && npm install && npm run build`
    );

    child.stdout?.on("data", function (data) {
      console.log("stdout:" + data);
    });
    child.stderr?.on("data", function (data) {
      console.log("stderr" + data);
    });
    child.on("close", (code) => resolve(""));
  });
};
