import { type, BuildinTypes, process, typedef } from "../meta-data";
import { ProcessUnit } from "../process-unit";
declare const agogos: {
    string: BuildinTypes.string;
    number: BuildinTypes.number;
    boolean: BuildinTypes.boolean;
    void: BuildinTypes.void;
    object: BuildinTypes.object;
    type: typeof type;
    Unit: typeof ProcessUnit;
    process: typeof process;
    typedef: typeof typedef;
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
};
export default agogos;
