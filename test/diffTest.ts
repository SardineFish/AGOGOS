import { diff } from "../build/lib.js";

let ans = diff([1, 2, 3, 4, 5, 6, 7, 8, 7,0,9,9], [0, 2, 3, 4, 5, 6, 6, 6, 8,0,0,0,0,0,0,0]);
console.log(ans);