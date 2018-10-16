import { type, BuildinTypes, process } from "../meta-data";
import { AGOGOS } from "../agogos";
export class Unit
{
    @type(BuildinTypes.string)
    public name: string;

    public process()
    {
        
    }
}
const agogos = {
    type,
    Unit,
    process, 
    console: {
        log: (message: any) => AGOGOS.instance.console.log(message),
        warn: (message: any) => AGOGOS.instance.console.warn(message),
        error: (message: any) => AGOGOS.instance.console.error(message),
    },
    ...BuildinTypes
};
export default agogos;