import lexicon from "./lexicon.mjs";
import { str } from "../../helpers.mjs";
const functions = {}

for (const name of Object.keys(lexicon.functions)){
    const funcName = str(name).dashedToCamelCase(); 
    functions[funcName] = (input) => {
        return `${name}(${input})`
    }
}

functions.inherit = (...props) => {
    const inheritObject = {}
    props.forEach(prop => {
        inheritObject[prop.toString()] = 'inherit'
    })
    return inheritObject; 
}

export default functions
