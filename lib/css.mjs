
import Unit from './css/lib/units.mjs';
import Color from './css/lib/color.mjs';
import lexicon from './css/lib/lexicon.mjs';
import { analyzer, str } from './helpers.mjs';
import functions from './css/lib/functions.mjs';

/* cssProperty => jsProperty */
const toDashedCase = function (string) {
    return string.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
} 
/* cjs3Property => cssPropertyString */
const toCamelCase = function(string){
    return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }); 
}
/* Object => boolean */
const supports = function(dec){
    if (typeof dec !== "string"){
        dec = stringifyDeclarations(dec).split(";");
    }
    const tester = document.createElement('div'); 
    for (let d of dec){
        tester.style = d;
        if (tester.getAttribute('style').length === 0){
            return false; 
        } 
    }
    return true; 
}
/* string => bool */
const isSelector = function(sel){
    try {
        document.querySelector(sel);
        return true; 
    }
    catch(e){
        return false; 
    }
}
/* Object => Object */
const filterSupported = function(decs){
    return parseDeclarations(stringifyDeclarations(decs).split(";").filter(d =>  supports(d.trim())).join(";")); 
}
/* Object => Object */
const filterUnsupported = function(decs){
    return parseDeclarations(stringifyDeclarations(decs).split(";").filter(d => ! supports(d.trim())).join(";")); 
}
/* Object/String => Object */
const stringifyDeclarations = function(dec){
    if (analyzer.str(dec)){return dec}
    const declarations = []
    Object.entries(dec).forEach(entry => {
        const [property,value] = [entry[0],entry[1]];
        if (analyzer(value).isWeakStr){
            declarations.push(`${toDashedCase(property)}:${value}`); 
        }
    });
    return `${declarations.join("; ")}`; 
}
/* Object/Strig => string */
const parseDeclarations = function(decStr){
    if (!decStr){return ""} 
    analyzer.enforce({'string':decStr});
    decObj = {};
    decStr.split(";").filter(d => d.length > 1).map(d => d.split(":")).forEach(d => decObj[css.toCamelCase(d[0].trim())] = d[1].trim());
    return decObj
}
/* string => Object */
const parseRules = function(ruleStr){
    const obj = {}; 
    analyzer(ruleStr).enforce('string');
    let str = (ruleStr.split("}")
    .map(e => e.split("{")))
    .map(e => [e[0],e[1]]=[e[0].trim(),parseDeclarations(e[1])])
    .filter(e => e[0].length > 0)
    .forEach(e => obj[e[0]] = e[1]);
    return obj;
}
/* Object => Object */
const extractDeclarations = function(object){
    analyzer(object).enforce('Object'); 
    const declarations = {}; 
    Object.entries(object)
        .filter(e => typeof e[1] === "string" || e[1] instanceof String) 
        .forEach(e => declarations[e[0]] = e[1]);
    return declarations;   
}
/* Object => Object */
const flattenRules = function walk(object,path=""){  
    analyzer(object).enforce('Object'); 
    const SS = {}
    for (let i in object) {
        const [key,value] = [i,object[i]];
        const nlyz = analyzer(value);
        const absPath =  formatSelector(path +  getSelector(key)).trim(); 
        const declarations = Object.entries(value).filter(e => analyzer(e[1]).isWeakStr).map(e => [toDashedCase(e[0]),e[1]]).map(e => e.join(":")) //).map(e => e.join(";")) // .forEach(e => declarations[e[0]] = e[1]);
        if (nlyz.isStrictObj){
            if (declarations.length > 0){
                SS[absPath] = declarations.join(";")
            }
            const nestedRules = walk(value,absPath); 
            Object.assign(SS,{...nestedRules});  
        } 
    }
    return SS            
}
/*  */
const generateStyleSheet = function(id=`CSSStyleSheet-${document.querySelectorAll('style').length}`){
    const stylesheet = document.createElement('style'); 
    stylesheet.id = id; 
    document.head.append(stylesheet); 
    return stylesheet
}

const css = {
    ...lexicon,
    functions,
    Color,
    Unit,
    toCamelCase,
    supports,
    // getSelector1,
    toDashedCase,
    // formatSelector1,
    isSelector,
    stringifyDeclarations,
    parseDeclarations,
    filterSupported,
    filterUnsupported,
    flattenRules,
    extractDeclarations,
    parseRules,
    generateStyleSheet, 
    lexicon,
}



for (let i in css.properties){
    css.properties[i].value = (v) => v; 
}

export default css;

/**
const getSelector1 = function(string) {
    const symbolMap = {
        "&": "",
        " " : " ",
        " > ":">",
        ":":":",
        "::":"::",
        ">":" > "
    };
    for (let k in symbolMap) {
        if (string.startsWith(k)) {
            return symbolMap[k] + string.slice(k.length);
        }
    }
    return " "+string;
}
const formatSelector1 = function(str=""){
    const reg = {
        "":[/(\>\s*$)/,/[\&]+/,/^(\s*\>)/],
        ">":[/(\s\>\s)/]
    }
    for (let r in reg){
        const replacement = r; 
        const regex = reg[r];
        regex.forEach(rg => {
            while (rg.test(str)){
                str = str.replace(rg,replacement)
            }
        });
    }
    return str; 
}
 */