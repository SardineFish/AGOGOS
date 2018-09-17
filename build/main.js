"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
electron_1.app.on("ready", function () {
    var window = new electron_1.BrowserWindow();
    window.loadFile("./main.js");
});
//# sourceMappingURL=main.js.map