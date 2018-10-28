import { type, process, typedef, iterableProcess, editor } from "../meta-data";
import { ProcessUnit } from "../process-unit";
declare const agogos: {
    string: string;
    number: string;
    boolean: string;
    void: string;
    object: string;
    array: (type: string | Function) => string;
    type: typeof type;
    Unit: typeof ProcessUnit;
    process: typeof process;
    editor: typeof editor;
    iterable: typeof iterableProcess;
    typedef: typeof typedef;
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
};
export default agogos;
