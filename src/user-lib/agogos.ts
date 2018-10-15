import { type, BuildinTypes } from "../meta-data";
import internal from "../agogos";
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
    console: internal.console,
    ...BuildinTypes
};
export default agogos;