

class RegExpArray  {
    constructor(...regexArray){
        for (let i in regexArray){
            this[i] = new RegExp(regexArray[i]);
        }
    }
    *[Symbol.iterator]() {
        for (const n of Object.values(this)){
            yield n;
        }
    };
    *[Symbol.matchAll](str) {
        let i = 0; 
        const a = []; 
        for (const n of this){
            a.push(...str.matchAll(n))
        }
        for (const n of a){
            yield n;
        }
    }
    [Symbol.replace](str){
        for (let n of this){
            str = RegExp.prototype[Symbol.replace].call(n, str, '#!@?');
        }
        return str; 
    }
}

export { RegExpArray }