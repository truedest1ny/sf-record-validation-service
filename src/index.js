import express from "express";
import { initDependencies } from "./app-container.js";
import { globalErrorHandler } from "./express/middleware/error-handler.js";

import EnvFileManager from "./io/env-file-manager.js";

const filename = '.env';

function main() {
  const app = express();

  const router = initDependencies();

  app.use(express.json());
  app.use(router);
  app.use(globalErrorHandler);

  const envFileManager = new EnvFileManager(filename);
  const { port } = envFileManager.getSystemProps();

  app.listen(port, () => console.log(`Server starts listening at port ${port}`));
}

main();




