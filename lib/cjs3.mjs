import CJS3 from "../index.js";
import css from "./css.mjs";
import { CJSArray, CJSObject } from "./extensions.mjs";
import { analyzer, str } from "./helpers.mjs";


const configuration = {
    global : {
        colors : true,
        properties : true,
        units : true,
        keyframes : true,
        functions : true,
    },
    strict : false,
    onError : () => {},
    syntax : {
        selectors : [
            // camelCase => camel-case
            [/(?!^[A-Z])([A-Z])/g , m => "-" + m.toLowerCase()],
            // $class => .class
            [/(\$(?=[A-Za-z]))/g , (m,...args) => {return "."}],
            // _div => > div
            [/(\_)/g, m => ">"],
            // space before everything not : 
            [/(^[^:])/g,m => " "+m],
            // '&' used to connect classes, psuedo-selectors etc... 
            [/(\s*\&\s*)/g, m => ""]
        ],
        properties : [
            
        ],
        values : [
            // any value ending with "!" => value+'!important'
            [/([!][\s]*$)/g,m => "!important"]
        ],
    }
};
const config = {
    get global(){
        return {
            get colors(){
                return configuration.global.colors 
            },
            get properties(){
                return configuration.global.properties 
            },
            get units(){
                return configuration.global.units 
            },
            set colors(v){

                analyzer(v).enforce('boolean')
                configuration.global.colors = v;
                if (v===true){
                    for (let color in css.colors){
                        global[color] = css.colors[color];
                        window[color] = css.colors[color];
                    }
                }
                return v; 
            },
            set properties(v){
                analyzer(v).enforce('boolean')
                configuration.global.properties = v;
                if (v===true){
                    for (let prop in properties){
                        try {
                            if (properties[prop]['value']){
                                const cjsprp = properties[prop]; 
                                const [p,vfn] = [cjsprp.property,cjsprp.value];
                                if (vfn.apply(global)){
                                    global[prop] = CJSObject.objectify(p,vfn.apply(global));
                                }
                                else {
                                    const globFN = function(...args){
                                        return CJSObject.objectify(p,vfn.apply(global,[...args]));
                                    }
                                    globFN.toString = () => {return css.toDashedCase(prop)}
                                    global[prop] = globFN; 
                                }
                            }
                            else {
                                global[prop] = ''; 
                            }
                        }
                        catch(e) {

                        }
                    }
                }
            },
            set units(v){
                analyzer(v).enforce('boolean')
                configuration.global.units = v;
                if (v===true){
                    for (let unit in css.units){
                        function unitfn(int){
                            return new css.Unit(int+unit); 
                        };
                        global[unit] = unitfn; 
                    }
                }
            },
            get keyframes(){
                return configuration.global.keyframes; 
            },
            set keyframes(v){
                if (v){
                    for (let i in keyframes){
                        global[i] = keyframes[i]; 
                    }
                }
                return true; 
            },
            get functions(){
                return configuration.global.functions;
            },
            set functions(v){
                configuration.global.functions = v;
                if (v){
                    for (let func in css.functions){
                        global[func] = css.functions[func]; 
                    }
                }
            }
        }
    },
    set global(configObj){
        for (let i in configObj){
            if (i in this.global){
                this.global[i] = configObj[i]; 
            }
            else {
                global[i] = configObj[i]; 
            }
        }
    },
    get strict(){
        return configuration.strict;
    },
    set strict(v){
        if (typeof v==='boolean'){
            configuration.strict = v; 
        }
        return true; 
    },
    get onError(){
        return configuration.onError
    },
    set onError(v){
        analyzer(v).enforce('function'); 
        configuration.onError = v;
    },
    get syntax(){
        return {
            get selectors(){
                return configuration.syntax.selectors
            },
            set selectors(v){
                analyzer.enforce({'array' : v});
                const regexesV = [...v].map(e => e=e[0].toString()); 
                configuration.syntax.selectors = [...this.selectors.filter(e => !regexesV.includes(e[0].toString())),...v];
            },
            get properties(){
                return configuration.syntax.properties; 
            },
            set properties(v){
                analyzer.enforce({'array' : v})
                const regexesV = [...v].map(e => e=e[0].toString()); 
                configuration.syntax.properties = [...this.properties.filter(e => !regexesV.includes(e[0].toString())),...v];
            },
            get values(){
                return configuration.syntax.values; 
            },
            set values(v){
                analyzer.enforce({'array' : v})
                const regexesV = [...v].map(e => e=e[0].toString()); 
                configuration.syntax.values = [...this.values.filter(e => !regexesV.includes(e[0].toString())),...v];
            }
        }; 
    },
    set syntax(syntaxObject){
        for (let i in syntaxObject){
            this.syntax[i] = syntaxObject[i]; 
        }
    }

};
const properties = new Proxy({...css.properties},{
    set : function(target,property,value){
        if (property in target){
        }
        if (!(value instanceof CJSProperty)){
            if (!value.name){
                value.name = property;
                target[value.name] = new CJSProperty(value);
            }
            else {
                target[value.name] = new CJSProperty(value);
            }
        }
        else {
            target[value.name] = value;
        }
        return true; 
    }
});
const keyframes = new Proxy({},{
    get : function(target,prop,reciever){
        return Reflect.get(...arguments);
    },
    set : function(target,property,value){
        const kfe = new CJSAnimation.KeyframeEffect(value);
        target[property] = kfe;
        if (config.global.keyframes){
            global[property] = kfe;
        } 
        return true; 
    },
});
const styleSheets = new Proxy({},{
    set : function(target,id,stylesheet){
        if (stylesheet instanceof CJSStyleSheet){
            target[id] = stylesheet;
        }
        else {
            target[id] = new CJSStyleSheet(stylesheet); 
        }
        return true; 
    }   
});
const defaultCSS = {
    getDefaultCSS(element){
        let defCSS = {}
        Object.entries(this).forEach(e => {
            if (element.matches(e[0])){
                defCSS = {...defCSS,...e[1]}
            }
        })
        const currentStyles = css.parseDeclarations(element.getAttribute('style'));
        for (let i in currentStyles){
            if (!(i in defCSS)){
                defCSS[i] =  ""           
            }
        }
        return defCSS  
    }
};


class CJSStyleObject extends CJSObject {
    constructor(object){
        super(object);
    }
    formatSelector(selectorString,implicit){
        config.syntax.selectors.forEach(
            rs => selectorString = selectorString.replace(rs[0],rs[1])
        );
        if (implicit){
            return this.formatSelector(implicit + selectorString)
        }
        return selectorString.replaceAll(/[\s]+/g," "); 
    }
    formatDeclaration(propertyValueEntry){
        return [
            this.formatProperty(propertyValueEntry[0]),
            this.formatValue(propertyValueEntry[1])
        ]
    }
    formatProperty(property){
        config.syntax.properties.forEach(
            rs => property = property.replace(rs[0],rs[1])
        )
        return property
    }
    formatValue(value){
        if (Array.isArray(value)){
            return value; 
        }
        config.syntax.values.forEach(
            rs => value = value.toString().replace(rs[0],rs[1])
        )
        return value
    }
};

class CJSStyleSheet extends CJSStyleObject { 
    get rules(){
        const rules = [];
        Object.values(this).forEach(rule => {
            if (rule instanceof CJSRule){
                rules.push(rule)
            }
            else if (Array.isArray(rule)){
                rule.forEach(r => {
                    if (r instanceof CJSRule){
                        rules.push(r)
                    }
                })
            }
        })
        return new CJSRuleList(rules); 
    }
    constructor(object){
        super(object);  
        this.id = object.id; 
        this.compile(object);
    }
    compile(object){
        const array = [];
        function shouldWalk(key,path="",value){
            if (key.startsWith("@") || CJSRule.isAtRule(key)){
                return false
            }
            else if (key.startsWith("--")){
                return false; 
            }
            return true
        }
        function handleShouldntWalk(key,value,path=""){
            if (key.startsWith("--")){
                 
            }
        }
        function walkAccPath(object,path=""){
            for (let key in object){ 
                if (CJSRule.isAtRule(key) && typeof object[key] === 'string'){
                    object[key]= object[key].split(";");
                }
                const absPath = this.formatSelector(key,path); 
                if (analyzer(object[key]).isStrictObj || Array.isArray(object[key])){
                    if (Array.isArray(object[key]) && properties[key] instanceof CJSProperty.Cluster){
                        continue; 
                    }
                    if (shouldWalk(key,absPath,object[key])){
                        walkAccPath.call(this,object[key],absPath); 
                    }
                    else {
                        handleShouldntWalk.call(this,key,object[key],absPath); 
                    }
                    const RULE = CJSRule.create(CJSObject.objectify(absPath,object[key]));
                    RULE.parentStyleSheet = this; 
                    if (RULE instanceof Array){
                        for (let i in RULE){
                            array.push(RULE[i]);
                        }
                    }
                    else {
                        array.push(RULE);
                    }
                    this[absPath.trim()] = RULE;
                    if (shouldWalk(key,absPath,object[key])){
                        defaultCSS[absPath.trim()] = (defaultCSS[absPath]) ? {...defaultCSS[absPath],...css.parseDeclarations(Object.values(RULE).map(r => r.cssText).join(";"))} : {...css.parseDeclarations(Object.values(RULE).map(r => r.cssText).join(";"))};
                    }
                }
            }
        }
        walkAccPath.call(this,object);
        document.querySelectorAll('*').forEach(element => {
            this.rules.forEach(rule => {
                if (rule instanceof CJSRule.StyleRule){
                    rule.attachMethods(element)
                }
            })
        });
        return array; 
    }
    stringify(type){
        if (type === 'object'){
            const obj = {};
            // [...this.styleSheet.cssRules].forEach(rule => obj[rule.cssText.slice(0,rule.cssText.indexOf('{'))] = rule.cssText.slice(rule.cssText.indexOf('{')))
            return obj; 
        }
        else if (type === 'array'){
            return this.rules.map(r => r.toString())
        }
        else {
            return this.stringify('array').join("\n")
        }
    }
    render(styleElement){
        this.rules.forEach(rule => {
            const cssText = `${rule.cssText.toString()}`;
            try {
                styleElement.sheet.insertRule(cssText);
            }
            catch(e){
                console.warn(e)
                console.log(cssText)
            }
        });
    }
};

class CJSRuleList extends CJSArray {
    constructor(object){
        super(object); 
        for (let i in object){
            this[i] = object[i]
        }
    }
    toString(){
        return this.eachToString().join("\n")
    }
    eachToString(){
        return [...this].map(r => r.toString());
    }
    get cssText(){
        return this.toString(); 
    }
    get cssTextArray(){
        return this.eachToString(); 
    }
};

class CJSRule extends CJSStyleObject {
    #styleSheet = null; 
    getDeclaration(property){
        return Object.values(this).filter(dec => dec.property === property)[0];
    }
    attachMethods(element){
        this.methods.forEach(method => {
            method.attachCallback(element);
        })
    }
    get parentStyleSheet(){
        return this.#styleSheet; 
    }
    set parentStyleSheet(v){
        if (this.#styleSheet == null){
            this.#styleSheet = v; 
        }
    }
    get cssText(){
        return this.toString(); 
    }
    static StyleRule = class CJSStyleRule extends CJSRule {
        constructor(ruleObject){
            super(ruleObject);
            let [selector,declarations] = Object.entries(ruleObject)[0]; 
            selector = selector.trim();
            Object.defineProperty(this,'selector',{get:function(){return selector}})
            const isDeclaration = o => !analyzer(o).isStrictObj && typeof o !== "function";
            const isMethod = o => typeof o === "function";
            this.declarations = new Map(); 
            this.methods = new Map(); 
            for (let i in declarations){
                const s = i;
                const obj = CJSObject.objectify(i,declarations[i]);   
                if (isMethod(declarations[i])){ 
                    const meth = new CJSMethod(obj);
                    this.methods.set(s,meth)
                    meth.defineGetters({
                        parentRule : this,
                        selector : this.selector,
                    });
                    Object.defineProperty(this,s,{
                        get:()=>{
                            return this.methods.get(s); 
                        },
                    })
                    meth.defineCallback();
                }
                if (isDeclaration(declarations[i])){
                    const dec = new CJSDeclaration(obj);
                    this.declarations.set(i,dec)
                    dec.defineGetters({
                        parentRule : this
                    });
                    Object.defineProperty(this,s,{
                        get:() => {
                            return this.declarations.get(s); 
                        },
                        set:(v)=>{

                            return this.declarations.get(s).value = v;
                        }
                    });
                } 
            } 
        }
        toString(){
            return this.selector + "{" + [...this.declarations.values()].map(r => r.cssText).join(";")+"}"
        }
    }
    static KeyframesRule = class CJSKeyframesRule extends CJSRule { 
        constructor(object){
            super(object);
            if (Object.keys(object)[0].trim() === "@keyframes" || Object.keys(object)[0].trim() === "keyframes"){
                const keyframeRules = new CJSArray();
                Object.values(object).forEach((v,i) => {
                    Object.entries(v).forEach((kf,i) => {
                        const [kfName,Rules] = kf;
                        const keyframe = new CJSRule.KeyframesRule(CJSObject.objectify('@keyframes ' + kfName,Rules)); 
                        // console.log(keyframe);
                        keyframeRules.push(keyframe);
                        
                    });
                });
                return keyframeRules;  
            }
            else {
                const [name,rules] = Object.entries(object)[0];
                Object.entries(rules).forEach((e,i) => {
                    const kfr = CJSObject.objectify(e[0],e[1]); 
                    this[i] = new CJSRule.KeyframesRule.KeyframeRule(kfr); 
                });
                const formattedName = name.replace('@','').replace('keyframes ',''); 
                keyframes[formattedName] = rules;
                this.define({
                    name : {
                        get : function(){
                            return formattedName; 
                        }
                    }
                }); 
            }
        }
        toString(){
            return `@keyframes ${this.name} { ${Object.values(this).map(e => e.cssText).join(" ")} }`
        }
        toObject(){
            return (Object.values(this).map(v => v.toObject()))
        }
        static KeyframeRule = class CJSKeyframeRule extends CJSRule {
            constructor(object){
                super(object); 
                const [prop,decs] = Object.entries(object)[0];
                Object.entries(decs).forEach((e,i) => {
                    const declaration = new CJSDeclaration(CJSObject.objectify(e[0],e[1]));
                    this[i] = declaration; 
                });
                try {
                    Object.defineProperties(this,{
                        frame : {
                            get : function(){
                                if (!isNaN(prop)){
                                    return prop+'%'
                                }
                                else if (prop === "from"){
                                    return "0%"
                                }
                                else if (prop==="to") {
                                    return "100%"
                                }
                            }
                        },
                        offset : {
                            get(){
                                return parseFloat(this.frame.replace("%"))/100;
                            }
                        }
                    })
                }
                catch(e){}
            }
            toString(){
                return `${this.frame} { ${Object.values(this).map(e => e.cssText).join(";")} }`
            }
            toObject(){
                const kfObject = {}
                Object.values(this).forEach(kf => kfObject[kf.property] = kf.value);
                kfObject.offset = this.offset; 
                return kfObject;
            }
        }
    }
    static ImportRule = class CJSImportRule extends CJSRule {
        constructor(object){
            super(object);
            const [name,imps] = Object.entries(object)[0]; 
            if (Array.isArray(imps)){
                const ims = []; 
                for (let i in imps){
                    ims.push(new CJSRule.ImportRule(CJSObject.objectify(i,imps[i])))
                }
                return ims; 
            }
            else {
                this.name = name; 
                this.import = imps; 
                this.define({
                    name : {
                        get(){
                            return name; 
                        }
                    },
                    import : {
                        get(){
                            return imps; 
                        }
                    }
                });
            }
        }
        toString(){
            let cssStr = ('@import '+this.import).replace(/(@import\s*){2,}/,'@import ').trim();
            return cssStr; 
        }
    }
    static MediaRule = class CJSMediaRule extends CJSRule {
        constructor(object){
            super(object);
            const [mediaText,innerObj] = Object.entries(object)[0];
            if (mediaText.trim() === "@media"){
                for (let i in innerObj){
                    innerObj["@media "+i] = innerObj[i]; 
                    delete innerObj[i];
                }
                const mediaRules = []; 
                for(let i in innerObj){
                    mediaRules.push(new CJSRule.MediaRule(CJSObject.objectify(i,innerObj[i])));
                }
                return (mediaRules);
                // return new CJSRule.MediaRule(innerObj); 
            }
            this.styleRules = []; 
            this.mediaText = mediaText; 
            function walkAccPath(object,path=""){
                for (let key in object){
                    const absPath = this.formatSelector(key,path);
                    if (analyzer(object[key]).isStrictObj || Array.isArray(object[key])){
                        walkAccPath.call(this,object[key],absPath);
                        const RULE = new CJSRule.StyleRule(CJSObject.objectify(absPath,object[key]));
                        this.styleRules.push(RULE);
                        // try {
                        //     Object.defineProperties(object[key],{
                        //         rule : {
                        //             get : function(){
                        //                 return RULE; 
                        //             },
                        //         },
                        //         index : {
                        //             get : function(){
                        //                 return this.size; 
                        //             } 
                        //         },
                        //         selector : {
                        //             get : function(){
                        //                 return absPath; 
                        //             } 
                        //         },
                        //     });
                        // }
                        // catch(e){}
                    }
                }
            }
            walkAccPath.call(this,innerObj); 
        }
        get cssText(){
            return `${this.mediaText} { ${this.styleRules.map(s => s.toString()).join("")} }`
        }
        toString(){
            return this.cssText; 
        }
    }
    static FontFaceRule = class CJSFontFaceRule extends CJSRule {
        constructor(object){

        }
    }
    static PageRule = class CJSPageRule extends CJSRule {
        constructor(object){

        }
    }
    static NamespaceRule = class CJSNamespaceRule extends CJSRule {
        constructor(object){

        }
    }
    static CounterStyleRule = class CJSCounterStyleRule extends CJSRule {
        constructor(object){

        }
    }
    static DocumentRule = class CJSDocumentRule extends CJSRule {
        constructor(object){

        }
    }
    static SupportsRule = class CJSSupportsRule extends CJSRule {
        constructor(object){

        }
    }
    static ViewportRule = class CJSViewportRule extends CJSRule {
        constructor(object){

        }
    }
    static get AtRules(){
        return {
            'import' : CJSRule.ImportRule,
            'media' : CJSRule.MediaRule,
            'fontFace' : CJSRule.FontFaceRule,
            'page' : CJSRule.PageRule,
            'namespace' : CJSRule.NamespaceRule,
            'keyframes' : CJSRule.KeyframesRule,
            'counterStyle' : CJSRule.CounterStyleRule,
            'document' : CJSRule.DocumentRule,
            'viewport' : CJSRule.ViewportRule,
            'supports' : CJSRule.SupportsRule,
            getRule(object){
                let key = Object.keys(object)[0].trim().replace('@','');
                key = key.split(" ")[0]
                if (key in this){
                    return this[key];
                }
                return CJSRule.StyleRule;
            }
        } 
    }
    static isAtRule(key){
        key = key.trim().replace('@','').split(" ")[0];
        return key in CJSRule.AtRules; 
    }
    static create(ruleObject){
        const Rule = CJSRule.AtRules.getRule(ruleObject);
        return new Rule(ruleObject);
    }
};

class CJSDeclaration extends CJSStyleObject {
    #valueArg = ""
    constructor(object){
        super(object)
        // const entries = Object.entries(object)[0];
        const entries = this.formatDeclaration(Object.entries(object)[0])
        let key = entries[0];
        let value = entries[1];
        if (CJSProperty.isProperty(key)){
            const CJSProperty = properties[key];
            const property = CJSProperty.property; 
            this.#valueArg = value;
            this.define({
                CJSProperty : {
                    get : function(){
                        return CJSProperty
                    }
                },
                propertyName : {
                    get : function(){
                        return this.CJSProperty.name; 
                    }
                },
                property : {
                    get : function(){
                        return this.CJSProperty.property; 
                    },
                },
                value : {
                    get : function(){
                        return this.#valueArg;
                    },
                    set : function(v){
                        this.#valueArg = v;
                        return true; 
                    }
                },
            }); 
        }
        else { 
            if (config.strict){
                new CJSError('CJSDeclarationError',`${key} not a valid css property \n => `,object); 
            }
        }
    }
    toString(){
        return this.cssText; 
    }
    get cssText(){
        if (Array.isArray(this.CJSProperty.property)){
            const vals = this.CJSProperty.value.apply(this,this.value);
            // console.log(this.CJSProperty.value.apply(this,this.value))
            for (let i in vals){
                vals[i] = this.property[i] +":"+ vals[i]; 
            }
            return vals.join("; ")
            // return this.CJSProperty.value(this.value).map(e => this.CJSProperty.property)
        }
        else if (this.CJSProperty.value() === this.value){
            return this.property + ":" + this.value;
        }
        return this.property + ":" + this.CJSProperty.value(this.value); 
    }
};

class CJSMethod extends CJSStyleObject {
    constructor(methodObject){
        const [event,method] = Object.entries(methodObject)[0];
        super();
        this.event = event; 
        this.method = method;
        // this.callback = this.defineCallback(); 
        this.cssText = "";  
    }
    defineCallback(){
        const name=this.event;
        const fn=this.method;
        const args = str(fn).between("(",")").remove("\"","\'").split("=").map(a => a.replaceAll("\"","").replaceAll("\'","").trim()); 
        const target = (args.length === 2) ? args[1] : false;
        const formatProp = this.formatProperty; 
        const formatVal = this.formatValue; 
        if (target){
            this.target = target; 
            const sel = this.selector
            const handler = function(element){ 
                const _$_ = new $Query(this); 
                const styles = fn.call(_$_,element);
                if (styles === false){
                    return _$_.cssRevert()
                }
                for (let i in styles){
                    const prop = formatProp(str(i).dashedToCamelCase()); 
                    this.style[prop] = formatVal(styles[i]); 
                } 
            }
            this.callback = (element) => {
                document.querySelectorAll(this.selector).forEach(el => {
                    handler.call(el,new $Query(element)); 
                }); 
            }
            this.attachCallback = (element) => {
                const callback = this.callback;
                if (element instanceof HTMLElement){
                    if (element.matches(this.target)){
                        if (css.events.isJSEvent(this.event)){
                            element.addEventListener(this.event,function(){
                                callback.call(element,element)
                            })
                        }
                        else {
                            element[this.event] = function(){
                                callback.call(element,element); 
                            }
                        }
                    }
                }
            }
        }
        else {
            this.target = this.selector; 
            this.callback = function(){ 
                const _$_ = new $Query(this); 
                const styles = fn.call(_$_);
                if (styles === false){
                    return _$_.cssRevert()
                }
                for (let i in styles){
                    const prop = formatProp(str(i).dashedToCamelCase()); 
                    this.style[prop] = formatVal(styles[i]);
                } 
            }
            this.attachCallback = (element) => {
                const callback = this.callback;
                if (element instanceof HTMLElement){
                    if (element.matches(this.target)){
                        
                        if (css.events.isJSEvent(this.event)){
                            element.addEventListener(this.event,function(){
                                callback.call(element); 
                            })
                        }
                        else {
                            element[this.event] = () => callback.call(element); 
                        }
 
                    }
                }
            }
        }
    }
};

class CJSProperty extends CJSStyleObject {
    static get properties(){return properties}; 
    constructor(propertyObject){
        super(propertyObject); 
        let {name,property,value,native} = {...propertyObject}
        if (Array.isArray(property)){
            return new CJSProperty.Cluster({name,property,value}); 
        }
        this.property = css.toDashedCase(property); 
        this.name = name; 
        this.value = value;
        this.nullValue = value; 
        this.native = (native) ? native : false;
        try {
            Object.defineProperties(this , {
                name : {
                    value : name,
                    writable : false
                },
                property : {
                    value : property,
                    writable : false
                },
                nullValue : {
                    get:function(){
                        return this.value(); 
                    }
                }
            });
        }
        catch(e){}
        properties[this.name] = this;
         
        properties[this.property] = this; 
        if (configuration.global.properties){
            const vfn = this.value;
            const prop = this.property;
            try {
                Object.defineProperty(global,this.name,{
                    get : function(){
                        const o = {}
                        o[prop] = vfn();
                        Object.defineProperty(o,'_',{
                            get : function(){
                                return (...args) => {
                                    const o1 = {}
                                    o1[prop] = vfn.call(this,...args);
                                    return o1; 
                                }; 
                            }
                        }) 
                        return o; 
                    }
                });
            } 
            catch(e){}
        }
        // properties[this.name] = this; 
    }
    static Cluster = class extends CJSStyleObject {
        constructor(clusterObj){
            super(); 
            let {name,property,value} = {...clusterObj}
            this.property = property.map(p => css.toDashedCase(p)); 
            this.name = (name) ? name : css.toCamelCase(property); 
            this.value = value;
            this.nullValue = value;
            try { 
                Object.defineProperties(this , {
                    name : {
                        value : name,
                        writable : false
                    },
                    property : {
                        value : property,
                        writable : false
                    },
                    nullValue : {
                        get:function(){
                            return this.value(); 
                        }
                    }
                });
            }
            catch(e){}
            if (configuration.global.properties){
                const vfn = this.value;
                const prop = this.property;
                try {
                    Object.defineProperty(global,this.name,{
                        get : function(){
                            const o = {}
                            for (let i in vfn){
                                o[prop][i] = vfn[i]();
                            }
                            return o; 
                        }
                    });
                } 
                catch(e){}
            }
        }
        
    }
    static isProperty(prop){
        return prop in CJSProperty.properties; 
    }
};

class CJSClass extends CJSStyleObject {
    /* TODO
    .txt- : (color,align,) => {
        return {
            color,
            size,
            ...other-styles
        }
    }
    <
    */
    constructor(){
        super()
    }
};

const $NODE = {
    defaultCSS(){
        return defaultCSS.getDefaultCSS(this);; 
    },
    /* Event Methods */
    on(event,callback,options){
        analyzer.enforce({string:event,function:callback});
        event = event.split(' ');
        for (const e in event){
            this.addEventListener(e,callback,options);
        }
        return this; 
    }, 
    observe(observerConfig={attributes : mutation => mutation,childList : mutation => mutation,subtree : mutation => mutation }){
        const config = {attributes : mutation => true,childList : mutation => true,subtree : mutation => true,...observerConfig}; 
        const callbacks = config; 
        const targetNode = this;
        const callback = function(mutationsList, observer) {
            for(const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    callbacks.childList(mutation);
                }
                if (mutation.type === 'attributes') {
                    callbacks.attributes(mutation);
                }
                if (mutation.type === 'subtree') {
                    callbacks.subtree(mutation);
                }
            }
        };
        const observer = new MutationObserver(callback)
        observer.observe(targetNode, config);
        this.observer = observer; 
        return this; 
    },
    clearListeners(clearChildren=false){
        if (clearChildren) {
            this.parentNode.replaceChild(this.cloneNode(true), this);
        }
        else {
            const clone = this.cloneNode(false);
            while (this.hasChildNodes()) this.appendChild(this.firstChild);
            this.parentNode.replaceChild(clone, this);
        }
    },
    /* Class Methods */
    addClass(...classes){
        this.classList.add(...classes);
        return this; 
    },
    removeClass(...classes){
        this.classList.remove(...classes);
        return this; 
    },
    replaceClass(...classes){
        this.classList.replace(...classes)
        return this; 
    },
    toggleClass(...classes){
        classes.forEach(c => this.classList.toggle(c))
        // this.classList.toggle(...classes)
        return this; 
    },
    shiftClass(...classes){
        document.querySelectorAll('*').forEach(node => node.classList.remove(...classes))
        this.addClass(...classes);
        return this; 
    },
    /* DOMString Methods */
    html(...DOMStrings){
        if (DOMStrings.length === 0){return this.innerHTML}
        this.innerHTML = DOMStrings.join(""); 
        return this; 
    },
    append(...DOMStrings){
        this.insertAdjacentHTML('beforeend',DOMStrings.join(""))
        return this; 
    },
    prepend(...DOMStrings){
        this.insertAdjacentHTML('afterbegin',DOMStrings.join(""))
        return this; 
    },
    before(...DOMStrings){
        this.insertAdjacentHTML('beforebegin',DOMStrings.join(""))
        return this; 
    },
    after(...DOMStrings){
        this.insertAdjacentHTML('afterend',DOMStrings.join(""))
        return this; 
    },
    txt(...text){
        if (text.length === 0){ return this.textContent }
        this.textContent = text.join(""); 
        return this; 
    },
    /*  Attribute */
    attr(name,value){
        if (name==null&&value==null){
            return this.attributes; 
        }
        else if (name && value==null){
            return this.getAttribute(name); 
        }
        else if (name && value){
            this.setAttribute(name,value); 
        }
        return this; 
    },
    toggleAttr(name,force){
        if (force==null){
            this.toggleAttribute(name)
        }
        else {
            this.toggleAttribute(name,force)
        }
        return this
    },
    removeAttr(name){
        this.removeAttribute(name);
        return this;  
    },
    val(value){
        if (value==null){
            return this.getAttribute('value'); 
        }
        this.setAttribute('value',value);
        return this; 
    },
    /*  Style Methods */
    css(cssObject){
        if (!cssObject){ return this.style}
        const styles = (analyzer.str(cssObject)) ? css.parseDeclarations(cssObject) : cssObject; 
        for (const prop in styles){
            this.style[css.toDashedCase(prop)] = styles[prop]; 
        }
        return this; 
    },
    cssRevert(){
        this.css(this.defaultCSS()); 
        return this; 
    },
    x(xPosition){
        if (!xPosition){ return this.offsetLeft }
        this.style.left = xPosition;
        return this; 
    },
    y(yPosition){
        if (!yPosition){ return this.offsetLeft }
        this.style.top = yPosition;
        return this; 
    },
    position(){
        return {
            y : this.offsetTop,
            x : this.offsetLeft,
        }
    },
    size(){
        return {
            height : this.offsetHeight,
            width : this.offsetWidth,
        }
    },
    height(height){
        if (height==0){ return this.offsetHeight }
        this.style.height = height;
        return this; 
    },
    width(width){
        if (!width){ return this.offsetWidth }
        this.style.width = width; 
        return this; 
    },
    /*  Query Methods */
    query(selectorString){
        return new $Query(this.querySelector(selectorString)); 
    },
    find(selectorString){
        return new $Query(this.querySelectorAll(selectorString));
    },
    parent(selectorString){
        if (selectorString){ return this.parentNode.matches(selectorString) }
        return new $Query(this.parentNode); 
    },
    ancestors(filter = (a) => true){
        const fn = (typeof filter === "string") ? a => a.matches(filter) : filter; 
        const ancestorNodes = []; 
        let currNode = this; 
        while(!(currNode instanceof Document)){
            ancestorNodes.push(currNode.parentNode); 
            currNode = currNode.parentNode; 
        }
        return ancestorNodes.filter(fn); 
    },
    childs(filter = (a) => true){
        const fn = (typeof filter === "string") ? a => a.matches(filter) : filter; 
        const children = []; 
        let currNode = this; 
        while(!(currNode instanceof Document)){
            children.push(currNode.parentNode); 
            currNode = currNode.parentNode; 
        }
        return children.filter(fn);
    },
    /* Animation Methods */
    Animate(keyframe,options={duration:1000,fill:'forwards'}){
        if (analyzer.obj(keyframe)){
            keyframe = new CJSAnimation.KeyframeEffect(keyframe); 
        }
        else if (analyzer.fn(keyframe)){
            keyframe = keyframe();
        }
        return this.animate(keyframe,options)
    },
    createAnimation(options){
        const anObj = {...options}
        anObj.target = this; 
        return new CJSAnimation({...options});  
    },
    /* Booleans */
    inView(){
        const rect = this.getBoundingClientRect();
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
        return(vertInView && horInView);
    },
}
class $Query extends Array {    
    constructor(...nodes){
        super()
        nodes
        .map(node => (typeof node === "string") ? document.querySelectorAll(node) : node)
        .map(node => (node instanceof NodeList) ? [...node] : node)
        .map(node => Array.isArray(node) ? node : [node])
        .forEach(nodes => {
            nodes.forEach(node => {
                CJSObject.assign(node,$NODE)
                this.push(node);
            });
        });
        if (this.length === 1){
            return this[0]; 
        }
    } 
    Animate(keyframe,args=[],options={duration:1000,fill:'forwards'}){
        const anim = []; 
        this.forEach(node => anim.push(node.Animate.call(node,keyframe,args,options)))
        return new CJSAnimationList(anim);
    }
    createAnimation(animationOptions){
        const animArray = []; 
        this.forEach(node => {
            animArray.push(node.createAnimation.call(node,{...animationOptions}))
        })
        return new CJSAnimationList(animArray);  
    }

    on(event,callback,options){
        this.forEach(node => node.on.apply(node,[event,callback,options]))
        return this;  
    }

    observe(observerConfig={attributes : mutation => mutation,childList : mutation => mutation,subtree : mutation => mutation }){
        this.forEach(node => node.observe.apply(node,[observerConfig]))
        return this; 
    }
    
    clearListeners(clearChildren=false){
        this.forEach(node => node.clearListeners.apply(node,[]))
        return this;
    }
    
    addClass(...classes){
        this.forEach(node => node.addClass.apply(node,[...classes]))
        return this; 
    }
    removeClass(...classes){
        this.forEach(node => node.removeClass.apply(node,[...classes]))
        return this; 
    }
    replaceClass(...classes){
        this.forEach(node => node.replaceClass.apply(node,[...classes]))
        return this; 
    }
    toggleClass(...classes){
        this.forEach(node => node.toggleClass.apply(node,[...classes]))
        return this; 
    }
    shiftClass(...classes){
        this.forEach(node => node.shiftClass.apply(node,[...classes]))
        return this; 
    }
    html(...DOMStrings){
        this.forEach(node => node.html.apply(node,[...DOMStrings]))
        return this;  
    }
    append(...DOMStrings){
        this.forEach(node => node.append.apply(node,[...DOMStrings]))
        return this;  
    }
    prepend(...DOMStrings){
        this.forEach(node => node.prepend.apply(node,[...DOMStrings]))
        return this;  
    }
    before(...DOMStrings){
        this.forEach(node => node.before.apply(node,[...DOMStrings]))
        return this;  
    }
    after(...DOMStrings){
        this.forEach(node => node.after.apply(node,[...DOMStrings]))
        return this;  
    }
    txt(...text){
        this.forEach(node => node.text.apply(node,...text))
        return this;  
    }
    attr(name,value){
        this.forEach(node => node.attr.apply(node,[name,value]))
        return this;  
    }
    toggleAttr(name,force){
        this.forEach(node => node.toggleAttr.apply(node,[name,force]))
        return this; 
    }
    removeAttr(name){
        this.forEach(node => node.removeAttr.apply(node,[name]))
        return this;  
    }
    val(value){
        this.forEach(node => node.val.apply(node,[value]))
        return this;  
    }
    css(cssObject){
        this.forEach(node => node.css.apply(node,[cssObject]))
        return this; 
    }
    cssRevert(){
        this.forEach(node => node.cssRevert.apply(node,[]))
        return this; 
    }
    x(xPosition){
        this.forEach(node => node.x.apply(node,[xPosition]))
        return this; 
    }
    y(yPosition){
        this.forEach(node => node.y.apply(node,[yPosition]))
        return this; 
    }
    height(height){
        this.forEach(node => node.height.apply(node,[height]))
        return this; 
    }
    width(width){
        this.forEach(node => node.width.apply(node,[width]))
        return this; 
    }
    
    query(filter = a => true){
        this.forEach(node => node.query.apply(node,[filter]))
        return this; 
    }
    parent(){
        this.forEach(node => node.parent.apply(node,[]))
        return this;  
    }
    ancestors(filter = (a) => true){
        this.forEach(node => node.ancestors.apply(node,[filter]))
        return this;  
    }
    childs(filter = (a) => true){
        this.forEach(node => node.childs.apply(node,[filter]))
        return this; 
    }
    nearest(filter = (a) => true){
        this.forEach(node => node.nearest.apply(node,[filter]))
        return this; 
    }
   
    animations(){
        this.forEach(node => node.animations.apply(node,[]))
        return this; 
    } 
    
    inView(){
        this.forEach(node => node.inView.apply(node,[]))
        return this;
    }

/********  EXTENSIONS ************/
    matches(selectorString){
        this.forEach(node => node.matches.apply(node,[selectorString]))
        return this;
    }
    scroll(...args){
        this.forEach(node => node.animate.apply(node,[...args]))
        return this;
    }
    scrollBy(...args){
        this.forEach(node => node.animate.apply(node,[...args]))
        return this;
    }
    scrollIntoView(...args){
        this.forEach(node => node.animate.apply(node,[...args]))
        return this;
    }
    scrollIntoViewIfNeeded(...args){
        this.forEach(node => node.animate.apply(node,[...args]))
        return this;
    }
    scrollTo(...args){
        this.forEach(node => node.animate.apply(node,[...args]))
        return this;
    }
    animate(...args){
        this.forEach(node => node.animate.apply(node,[...args]))
        return this;
    }   
    attachShadow(...args){
        this.forEach(node => node.attachShadow.apply(node,[...args]))
        return this;
    }
    closest(...args){
        this.forEach(node => node.closest.apply(node,[...args]))
        return this;
    }
    computedStyleMap(...args){
        this.forEach(node => node.computedStyleMap.apply(node,[...args]))
        return this;
    }
    createShadowRoot(...args){
        this.forEach(node => node.createShadowRoot.apply(node,[...args]))
        return this;
    }
    getAnimations(...args){
        this.forEach(node => node.getAnimations.apply(node,[...args]))
        return this;
    }
    getAttribute(...args){
        this.forEach(node => node.getAttribute.apply(node,[...args]))
        return this;
    }
    getAttributeNames(...args){
        this.forEach(node => node.getAttributeNames.apply(node,[...args]))
        return this;
    }
    getAttributeNode(...args){
        this.forEach(node => node.getAttributeNode.apply(node,[...args]))
        return this;
    }
    getAttributeNodeNS(...args){
        this.forEach(node => node.getAttributeNodeNS.apply(node,[...args]))
        return this;
    }
    getAttributeNS(...args){
        this.forEach(node => node.getAttributeNS.apply(node,[...args]))
        return this;
    }
    getBoundingClientRect(...args){
        this.forEach(node => node.getBoundingClientRect.apply(node,[...args]))
        return this;
    }
    getClientRects(...args){
        this.forEach(node => node.getClientRects.apply(node,[...args]))
        return this;
    }
    getElementsByClassName(...args){
        this.forEach(node => node.getElementsByClassName.apply(node,[...args]))
        return this;
    }
    getElementsByTagName(...args){
        this.forEach(node => node.getElementsByTagName.apply(node,[...args]))
        return this;
    }
    getElementsByTagNameNS(...args){
        this.forEach(node => node.getElementsByTagNameNS.apply(node,[...args]))
        return this;
    }
    hasAttribute(...args){
        this.forEach(node => node.hasAttribute.apply(node,[...args]))
        return this;
    }
    hasAttributeNS(...args){
        this.forEach(node => node.hasAttributeNS.apply(node,[...args]))
        return this;
    }
    hasAttributes(...args){
        this.forEach(node => node.hasAttributes.apply(node,[...args]))
        return this;
    }
    hasPointerCapture(...args){
        this.forEach(node => node.hasPointerCapture.apply(node,[...args]))
        return this;
    }
    insertAdjacentElement(...args){
        this.forEach(node => node.insertAdjacentElement.apply(node,[...args]))
        return this;
    }
    insertAdjacentHTML(...args){
        this.forEach(node => node.insertAdjacentHTML.apply(node,[...args]))
        return this;
    }
    insertAdjacentText(...args){
        this.forEach(node => node.insertAdjacentText.apply(node,[...args]))
        return this;
    }
    msZoomTo(...args){
        this.forEach(node => node.msZoomTo.apply(node,[...args]))
        return this;
    }
    querySelector(...args){
        this.forEach(node => node.querySelector.apply(node,[...args]))
        return this;
    }
    querySelectorAll(...args){
        this.forEach(node => node.querySelectorAll.apply(node,[...args]))
        return this;
    }
    releasePointerCapture(...args){
        this.forEach(node => node.releasePointerCapture.apply(node,[...args]))
        return this;
    }
    removeAttribute(...args){
        this.forEach(node => node.removeAttribute.apply(node,[...args]))
        return this;
    }
    removeAttributeNode(...args){
        this.forEach(node => node.removeAttributeNode.apply(node,[...args]))
        return this;
    }
    removeAttributeNS(...args){
        this.forEach(node => node.removeAttributeNS.apply(node,[...args]))
        return this;
    }
    replaceChildren(...args){
        this.forEach(node => node.replaceChildren.apply(node,[...args]))
        return this;
    }
    replaceWith(...args){
        this.forEach(node => node.replaceWith.apply(node,[...args]))
        return this;
    }
    requestFullscreen(...args){
        this.forEach(node => node.requestFullscreen.apply(node,[...args]))
        return this;
    }
    requestPointerLock(...args){
        this.forEach(node => node.requestPointerLock.apply(node,[...args]))
        return this;
    }
    scrollBy(...args){
        this.forEach(node => node.scrollBy.apply(node,[...args]))
        return this;
    }
    scrollIntoViewIfNeeded(...args){
        this.forEach(node => node.scrollIntoViewIfNeeded.apply(node,[...args]))
        return this;
    }
    scrollTo(...args){
        this.forEach(node => node.scrollTo.apply(node,[...args]))
        return this;
    }
    setAttribute(...args){
        this.forEach(node => node.setAttribute.apply(node,[...args]))
        return this;
    }
    setAttributeNode(...args){
        this.forEach(node => node.setAttributeNode.apply(node,[...args]))
        return this;
    }
    setAttributeNodeNS(...args){
        this.forEach(node => node.setAttributeNodeNS.apply(node,[...args]))
        return this;
    }
    setAttributeNS(...args){
        this.forEach(node => node.setAttributeNS.apply(node,[...args]))
        return this;
    }
    setCapture(...args){
        this.forEach(node => node.setCapture.apply(node,[...args]))
        return this;
    }
    setHTML(...args){
        this.forEach(node => node.setHTML.apply(node,[...args]))
        return this;
    }
    setPointerCapture(...args){
        this.forEach(node => node.setPointerCapture.apply(node,[...args]))
        return this;
    }
    toggleAttribute(...args){
        this.forEach(node => node.toggleAttribute.apply(node,[...args]))
        return this;
    }
}

const errorLog = [];

class CJSError extends Error {
    constructor(error,message){
        super(message); 
        this.name = error;
        CJSError.handler(this);
        errorLog.push(this);  
    }
    static get handler(){
        return configuration.onError;
    }
}

class CJSKeyframes {
    constructor(obj){
        CJS3.keyframes = obj; 
        return CJS3.keyframes; 
    }
    static Effect = class {
        constructor(arg){
            if (analyzer.obj(arg)){
                this.effectConstructor = () => {
                    return this.KeyFrameObjToArray(arg)
                }
            }
            else if (analyzer.arr(arg)){
                this.effectConstructor = () => {
                    return arg; 
                }
            }
            else if (analyzer.fn(arg)){
                this.effectConstructor = (...argv) => {
                    return this.KeyFrameObjToArray(arg(...argv)); 
                }
            }
            return (...argv) => new KeyframeEffect(null,this.effectConstructor(...argv),this.options).getKeyframes(); 
        }
        KeyFrameObjToArray(obj){
            this.options = {}; 
            this.keyframes = Object.entries(obj).map(e => {
                if (e[0] === 'options'){
                    this.options = e[1];
                    return null; 
                }
                let [offset,styles] = [parseInt(e[0].replace(/(\%|from|to)/,r=>(r==='from')?0:100))/100,e[1]]; 
                const newSty = {}
                for (let i in styles){
                    newSty[i] = new CJSDeclaration(CJSObject.objectify(i,styles[i])); 
                }
                return {offset,...styles}; 
            });
            return this.keyframes
        }
    }
}

class CJSAnimation extends Animation{
    static defaultOptions = {
        duration : 1000,
        fill : 'forwards',
        ease : 'ease',
    }
    static defaultConfig = {
        target:null, // query -> selectorString | node
        id:"", // string
        /* State Setters */

        play:"", // event -> string
        pause:"", // event -> string
        finish:"", // event -> string
        reverse:"", // event -> string
        cancel:"", // event -> string
        /* Timing */
        playbackRate:null, // number
        updatePlaybackRate:null, // number
        startTime:null, // number -> float (to thousandths)
        /* Other */
        commitStyles:false, // null 
        persist:false, // null
        /* Handlers */
        oncancel:()=>{}, // function
        onremove:()=>{}, // function
        onfinish:()=>{}, // function
    }
    static KeyframeEffect = class {
        constructor(arg){
            if (analyzer.obj(arg)){
                this.effectConstructor = () => {
                    return this.KeyFrameObjToArray(arg)
                }
            }
            else if (analyzer.arr(arg)){
                this.effectConstructor = () => {
                    return arg; 
                }
            }
            else if (analyzer.fn(arg)){
                this.effectConstructor = (...argv) => {
                    return this.KeyFrameObjToArray(arg(...argv)); 
                }
            }
            return (...argv) => new KeyframeEffect(null,this.effectConstructor(...argv),this.options).getKeyframes(); 
        }
        KeyFrameObjToArray(obj){
            this.options = {}; 
            this.keyframes = Object.entries(obj).map(e => {
                if (e[0] === 'options'){
                    this.options = e[1];
                    return null; 
                }
                let [offset,styles] = [parseInt(e[0].replace(/(\%|from|to)/,r=>(r==='from')?0:100))/100,e[1]]; 
                const newSty = {}
                for (let i in styles){
                    newSty[i] = new CJSDeclaration(CJSObject.objectify(i,styles[i])); 
                }
                return {offset,...styles}; 
            });
            return this.keyframes
        }
    }
    constructor(animationObject={effect:null,target:null,options:CJSAnimation.defaultOptions,timeline:document.timeline,settings:false}){
        animationObject = {...animationObject}
        let {effect,target,options,timeline,settings,argv} = {...animationObject}; 
        argv = (argv) ? argv : []; 
        options = (options) ? options : CJSAnimation.defaultOptions; 
        if (analyzer.fn(effect)){
            effect = effect(...argv); 
        }
        if (!(effect instanceof KeyframeEffect)){
            effect = new KeyframeEffect(target,effect,options)
        }
        if (settings){
            this.configure(settings); 
        }
        super(effect,timeline); 
    }
    configure(animationConfiguration){
        animationConfiguration = {...CJSAnimation.defaultConfig,...animationConfiguration}
        const target = (animationConfiguration.target) ? document.querySelectorAll(animationConfiguration.target) : [this.effect.target]; 
        delete animationConfiguration.target; 
        for (let t in animationConfiguration){
            if (animationConfiguration[t] && ['play','pause','remove','cancel','finish'].includes(t)){
                if (css.events.isJSEvent(animationConfiguration[t])){
                    target.forEach(node => node.addEventListener(animationConfiguration[t],() => this[t]()))
                }
                else if (css.events.isDOMEvent(animationConfiguration[t])){
                    target[animationConfiguration[t]] = () => this[t](); 
                }
                delete animationConfiguration[t]
            }
            if (animationConfiguration.commitStyles){
                this.commitStyles(); 
            }
            if (animationConfiguration.persist){
                this.persist(); 
            }
            if (['oncancel','onfinsh','onremove'].includes(t)){
                this[t] = animationConfiguration[t]; 
            }
        }
    }
}

class CJSAnimationList extends Array {
    constructor(animList=[]){
        super(); 
        this.push(...animList)
        Object.getOwnPropertyNames(Animation.prototype).forEach(method => {
            this[method] = (...args) => {
                this.map(anim => anim[method](...args)); 
            }
        });
    }
}


export {
    CJSAnimation, CJSKeyframes, $Query, keyframes, properties, config, CJSStyleObject, CJSStyleSheet, CJSRuleList, CJSRule, CJSDeclaration, CJSProperty, CJSError, styleSheets, defaultCSS
};

