const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "src", "routes", "ai");
if (fs.existsSync(dir)) {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("Deleted:", dir);
} else {
  console.log("Already gone:", dir);
}
