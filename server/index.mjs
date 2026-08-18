import "dotenv/config";
import app from "./app.mjs";

const port = Number(process.env.PORT || 3001);
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Digital Trust Solutions server listening on http://127.0.0.1:${port}`);
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the previous API process and run the command again.`);
  } else {
    console.error("The Digital Trust Solutions server could not start.");
  }
  process.exit(1);
});
