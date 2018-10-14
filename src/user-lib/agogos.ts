import { type, BuildinTypes } from "../meta-data";
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
    ...BuildinTypes
}
export default agogos;