import { type, BuildinTypes, process, typedef, iterableProcess } from "../meta-data";
import { AGOGOS } from "../agogos";
import { ProcessUnit } from "../process-unit";

const agogos = {
    type,
    Unit: ProcessUnit,
    process,
    iterable: iterableProcess,
    typedef,
    console: {
        log: (message: any) => AGOGOS.instance.console.log(message),
        warn: (message: any) => AGOGOS.instance.console.warn(message),
        error: (message: any) => AGOGOS.instance.console.error(message),
    },
    ...BuildinTypes
};
export default agogos;