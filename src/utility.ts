export function getKeys(obj: any)
{
    let keys: string[] = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key))
        {
            keys.push(key);
        }
    }
    return keys;
}