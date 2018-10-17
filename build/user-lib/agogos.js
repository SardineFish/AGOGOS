"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meta_data_1 = require("../meta-data");
const agogos_1 = require("../agogos");
const process_unit_1 = require("../process-unit");
const agogos = {
    type: meta_data_1.type,
    Unit: process_unit_1.ProcessUnit,
    process: meta_data_1.process,
    typedef: meta_data_1.typedef,
    console: {
        log: (message) => agogos_1.AGOGOS.instance.console.log(message),
        warn: (message) => agogos_1.AGOGOS.instance.console.warn(message),
        error: (message) => agogos_1.AGOGOS.instance.console.error(message),
    },
    ...meta_data_1.BuildinTypes
};
exports.default = agogos;
//# sourceMappingURL=agogos.js.map