import { $Query, CJSAnimation, CJSDeclaration, CJSKeyframes, CJSProperty, CJSRule, CJSStyleSheet, config, defaultCSS, keyframes, properties, styleSheets } from "./lib/cjs3.mjs";
import css from "./lib/css.mjs";
import { analyzer } from "./lib/helpers.mjs";

// const cjs3 = {
//     ...css,
//     lexicon:css.lexicon,
//     StyleSheet:CJSStyleSheet,
//     Rule:CJSRule,
//     Declaration:CJSDeclaration,
//     Property:CJSProperty,
//     Keyframes:CJSKeyframes,
//     $Query,
//     $ : (...queries) => new $Query(...queries),
//     get keyframes(){
//         return keyframes; 
//     },
//     set keyframes(v){
//         for (let p in v){
//             this.keyframes[p] = v[p]; 
//         }
//     },
//     get properties(){
//         return properties; 
//     },
//     set properties(v){
//         for (let p in v){
//             console.log(p);

//             v[p].name = p;
//             this.properties[p] = v[p]; 
//         }
//     },
//     get config(){
//         return {
//             get globals(){
//                 return {
//                     get colors(){
//                         return this.config.global.colors 
//                     },
//                     get properties(){
//                         return this.config.global.properties 
//                     },
//                     get units(){
//                         return this.config.global.units 
//                     },
//                     set colors(v){
//                         analyzer(v).enforce('boolean')
//                         this.config.global.colors = v;
//                         if (v){
//                             for (let color in css.colors){
//                                 global[color] = css.colors[color]
//                             }
//                         }
//                         return v; 
//                     },
//                     set properties(v){
//                         analyzer(v).enforce('boolean')
//                         this.config.global.properties = v;
//                         if (v){
//                             for (let prop in this.properties){
//                                 try{
//                                     if (this.properties[prop]['value']){
//                                         global[prop] = this.properties[prop]['value']
//                                     }
//                                     else {
//                                         global[prop] = ''; 
//                                     }
//                                 }
//                                 catch(e) {
        
//                                 }
//                             }
//                         }
//                         else {
//                             global[this.properties[prop]] = undefined; 
//                         }
                        
//                     },
//                     set units(v){
//                         analyzer(v).enforce('boolean')
//                         this.config.global.units = v;
//                         if (v){
//                             for (let unit in css.units){
//                                 function unitfn(int){
//                                     return new this.Unit(int+unit); 
//                                 };
//                                 global[unit] = unitfn; 
//                             }
//                         }
//                         else {
//                             global[css.properties[prop]] = undefined; 
//                         }
//                     },
//                     get keyframes(){
//                         return keyframes; 
//                     },
//                     set keyframes(v){
//                         if (v){
//                             for (let i in keyframes){
//                                 global[i] = keyframes[i]; 
//                             }
//                         }
//                         return true; 
//                     },
//                 }
//             },
//             set globals(configObj){
                
//                 for (let i in configObj){
//                     if (i in this.global){
                        
//                         this.global[i] = configObj[i]; 
//                     }
//                     else {
//                         global[i] = configObj[i]; 
//                     }
//                 }
//             },
//             get strict(){
//                 return config.strict; 
//             },
//             set strict(v){
//                 if (typeof v==='boolean'){
//                     config.strict = v; 
//                 }

//             },
//             get errors(){
//                 return {
//                     get onError(){
//                         return this.config.errors.onError;
//                     },
//                     set onError(v){
//                         this.config.errors.onError = v; 
//                         return v; 
//                     },
//                     get logError(){
//                         return this.config.errors.logErrors;
//                     },
//                     set logError(v){
//                         this.config.errors.logErrors = v; 
//                         return v; 
//                     }
//                 }
//             },
//         }
//     },
//     set config(obj){
//         for (let i in obj){
//             try {
//                 this.config[i] = obj[i]; 
//             }
//             catch(e){}
//         }
//     },
//     get global(){
//         return global; 
//     },
//     set global(v){
//         Object.assign(global,v); 
//     }
// }

const constructors = [];

const helperSS = {
    styleSheet : null,
    get sheet(){
        return this.styleSheet.sheet;
    }
}

class CJS3 {
    static activeTheme = "";
    static get styleSheets(){
        return styleSheets; 
    }
    static set styleSheets(v){
        for (let p in v){
            styleSheets[p] = v[p]; 
        }
    }
    static get keyframes(){
        return keyframes; 
    }
    static set keyframes(v){
        for (let p in v){
            this.keyframes[p] = v[p]; 
        }
    }
    static get properties(){
        return properties; 
    }
    static set properties(v){
        for (let p in v){
            if (!v.name){
                v.name = cjs3.toDashedCase(p);

            }
            this.properties[p] = v[p]; 
        }
    }
    static get config(){
        return config;
    }
    static set config(obj){
        for (let i in obj){
            this.config[i] = obj[i]; 
        }
    }
    static get globals(){
        return global; 
    }
    static set globals(v){
        Object.assign(global,v);
    }
    static Themes = class extends Object {
        constructor(themeObj){
            super()
            for (let i in themeObj){
                if (i !== 'active') {
                    Object.defineProperty(this,i,{
                        get:function(){
                            return themeObj[i]
                        }
                    })
                }
            }
            this.activeTheme = themeObj.active; 
        }
        get activeTheme(){
            return CJS3.activeTheme; 
        }
        set activeTheme(themeID){
            const theme = this[themeID];
            CJS3.activeTheme = themeID;
            if (CJS3.config.global.properties){
                for (let t in theme){
                    global[t] = theme[t]; 
                }
            }
            constructors.forEach(ss => {
                if (ss.rendered){
                    ss.reRender(); 
                }
            })
        }
    }
    constructor(styleSheetConstructor){
        const constructor = (analyzer.fn(styleSheetConstructor)) ? styleSheetConstructor : () => styleSheetConstructor;
        this.constructorObject = {...constructor.call(this)};
        this.styleSheetConstructor = constructor;
        this.styleElement = null;
        this.styleSheet = null; 
        this.isRendered = false;
        constructors.push(this);
    }
    generateStyleSheet(...args){
        const ssObject = this.styleSheetConstructor.call(this,...args);
        analyzer.enforce({'object':ssObject})
        return new CJS3.StyleSheet(ssObject);
    }
    render(...args){
        if (this.isRendered){
            return; 
        }
        this.styleElement = css.generateStyleSheet(this.constructorObject.id); 
        this.styleSheet = this.generateStyleSheet(...args)
        this.styleSheet.render(this.styleElement); 
        CJS3.styleSheets[this.styleElement.id] = (this.styleSheet); 
        this.isRendered = true; 
    }
    remove(){
        this.styleElement.remove(); 
        this.isRendered = false; 
    }
    reRender(...args){
        this.remove();
        this.render(); 
    }
    static defaultCSS = defaultCSS;
    static Unit = css.Unit;
    static Color = css.Color;
    static StyleSheet=CJSStyleSheet;
    static Rule=CJSRule;
    static Declaration=CJSDeclaration;
    static Property=CJSProperty;
    static Properties = class {
        constructor(object){
            analyzer.enforce({object});
            for (let i in object){
                object.name = i; 
                CJS3.properties[i] = object[i];
                this[i] = CJS3.properties[i]; 
            }
        }
    }
    static Animation= CJSAnimation;
    static Keyframes = CJSKeyframes; 
    static KeyframeEffect=CJSAnimation.KeyframeEffect
    static $Query = $Query;
    static $ = (...queries) => new $Query(...queries)
}

const __init__ = function(){
    CJS3.config = {
        global : {...config.global},
        onError : config.onError,
        strict : config.strict,
        syntax : {
            selectors : [...config.syntax.selectors],
            properties : [...config.syntax.properties],
            values : [...config.syntax.values],
        }
    }
    const attachMethods = (nodes) => {
        Object.values(CJS3.styleSheets).forEach(ss => {
            nodes.forEach(node => {
                ss.rules.forEach(rule => {
                    if (rule instanceof CJSRule.StyleRule){
                        rule.attachMethods(node)
                    }
                });
            })
        })
    }
    new $Query('body').observe({
        childList : (mutation) => {
            attachMethods(mutation.addedNodes);
            mutation.addedNodes.forEach(node => {
                // defaultCSS.set(node,node.style)
            })
        },
        subtree : (mutation)=> {
            attachMethods(mutation.addedNodes);
            mutation.addedNodes.forEach(node => {
                // defaultCSS.set(node,node.style)
            })
        }
    });
    // const cjs3HelperNode = document.createElement('style');
    // cjs3HelperNode.id = 'cjs3-helper-node';
    // document.head.append(cjs3HelperNode);
    // helperSS.styleSheet = cjs3HelperNode;
    // global['_$'] = helperSS; 
};

__init__(); 

export default CJS3