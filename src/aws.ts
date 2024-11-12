import { s3client } from "./s3client";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import path, { resolve } from "path";
import fs, { createWriteStream, WriteStream } from "fs";
import { Readable } from "stream";

export const downloadS3Folder = async (prefix: string) => {
  // Command to List of all the files in the Bucket
  const files = new ListObjectsV2Command({
    Bucket: "vercelcrytek",
    Prefix: prefix,
  });

  // Contains all the files
  const allFiles = await s3client.send(files);

  // Iterate to all the files to create a directory with respective to the files
  const allFunctions =
    allFiles?.Contents?.map(async (elem) => {
      const Key = elem.Key || "";
      const finalPath = path?.join(__dirname, Key);
      const dirName = path.dirname(finalPath);

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      // Creating Write Stream to add File
      const outputFile: WriteStream = createWriteStream(finalPath);

      // Get Objects Commands
      const getObjectCommand = {
        Bucket: "vercelcrytek",
        Key: Key,
      };

      // Writting all the Files to the Write Stream
      const Object = new GetObjectCommand(getObjectCommand);
      const response = await s3client.send(Object);
      const s3stream = response.Body as Readable;
      s3stream.pipe(outputFile).on("finish", () => {
        resolve("");
      });
    }) || [];
  console.log("Awaiting");
  // await Promise.all(allFunctions?.filter((x) => x !== undefined));
};

const getAllFolder = (folderPath: string) => {
  let response: string[] = [];
  const allFileandFolder = fs.readdirSync(folderPath);
  allFileandFolder.forEach((file) => {
    const fullFilePath = path.join(__dirname, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFolder(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

const uploadFile = async (fileName: string, folderPath: string) => {
  const fileContent = fs.readFileSync(folderPath);
  const params = {
    Body: fileContent,
    Bucket: "vercelcrytek",
    Key: fileName,
  };

  try {
    const data = await s3client.send(new PutObjectCommand(params));
    console.log("New Build is stored in the aws");
  } catch (error) {
    console.log(error);
  }
};

export const copyFullDir = (id: string|undefined) => {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFolder(folderPath);
  allFiles.map((file) => {
    uploadFile(`dist/${id}` + file.slice(folderPath.length + 1), file);
  });
};
