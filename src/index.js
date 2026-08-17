import express from "express";
import { initDependencies } from "./app-container.js";
import { globalErrorHandler } from "./express/middleware/error-handler.js";

function main() {
  const app = express();

  const router = initDependencies();

  app.use(express.json());
  app.use(router);
  app.use(globalErrorHandler);

  const port = 8888;
  app.listen(port, () => console.log(`Server starts listening at port ${port}`));
}

main();


