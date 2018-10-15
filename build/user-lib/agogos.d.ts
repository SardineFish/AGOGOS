import { type, BuildinTypes } from "../meta-data";
export declare class Unit {
    name: string;
    process(): void;
}
declare const agogos: {
    string: BuildinTypes.string;
    number: BuildinTypes.number;
    boolean: BuildinTypes.boolean;
    object: BuildinTypes.object;
    type: typeof type;
    Unit: typeof Unit;
    console: {
        log: (message: any) => void;
        warn: (message: any) => void;
        error: (message: any) => void;
    };
};
export default agogos;
