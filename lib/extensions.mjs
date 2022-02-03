import css from "./css.mjs";
import { analyzer } from "./helpers.mjs";

class CJSObject extends Object {
    constructor(object){
        super(object); 
        // this.defineGetters({_:object}); 
    }
    objectify(prop){
        const o = {}; 
        o[prop] = this.src[prop];
        return o;  
    }
    walkAccPath(handler,object=this._,path=""){
        for (let key in object){ 
            handler.call(this,path,object[key]);
            const absPath = (css.formatSelector(path + css.getSelector(key))).trim(); 
            if (analyzer(object[key]).isStrictObj){
                this.walkAccPath(handler,object[key],absPath); 
            }
        }
    }
    define(props){
        Object.defineProperties(this,props);
        return this; 
    }
    defineGetters(obj){
        for (let i in obj){
            Object.defineProperty(this,i,{
                get : function(){
                    return obj[i]; 
                }
            })
        }

    }; 
    isRule(obj){
        return analyzer(obj).isStrictObj
    };
    static assign(obj,objToCopy){
        const objMethods = analyzer(obj).methods;
        analyzer(objToCopy).methods.filter(m => !objMethods.includes(m)).forEach(m => obj[m] = objToCopy[m]);
    }
    static objectify(prop,val){
        const o = {}; 
        o[prop] = val;
        return o;  
    }

}

class CJSArray extends Array {
    constructor(){
        super();
    }
    delete(index){
        this.splice(index,1); 
    }
    // replace(el,handler){
    //     let truth = false
    //     this.forEach((e,index)=>{
    //         if (handler.call(this,e,index)){
    //             truth = true; 
    //             this[index] = el; 
    //         }
    //     });
    //     if (!truth){
    //         this.push(el); 
    //     }
    //     return this; 
    // }
    get(filter){
        for (let i in this){
            if (filter(this[i])){
                return this[i]
            }
        }
    }
    define(obj){
        Object.defineProperties(this,obj); 
    }
    walkAccPath(handler,object=this._,path=""){
        for (let key in object){
            const absPath = css.formatSelector(path + css.getSelector(key)); 
            handler.call(this,key,object[key]); 
            if (analyzer(object[key]).isStrictObj){
                this.walkAccPath(handler,object[key],absPath); 
            }
        }
    }
    defineGetters(obj){
        for (let i in obj){
            Object.defineProperty(this,i,{
                get : function(){
                    return obj[i]; 
                }
            })
        }

    }; 
}

export {CJSObject, CJSArray}