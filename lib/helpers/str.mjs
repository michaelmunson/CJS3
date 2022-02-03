

class Str extends String {
    constructor(string){
        super(string);
    }
    stack(ch1,ch2){
        if (ch2 == null){
            ch2 = (ch1=="(") ? ")" : (ch1=="[") ? "]" : (ch1=="{") ? "}" : ")";
        }
        let stk = 1; let ind = -1;

        for (let i in this){
            if (this.charAt(i) == ch1){
                stk += 1;
            }
            if (this.charAt(i) == ch2){
                stk -= 1; 
            }
            if (stk == 0){
                ind = i;
                break; 
            }
        }
        return new Str(this.slice(this.indexOf("(")+1,ind));
    }
    format(regexs,formater = match => ""){
    }
    camelCaseToDashed(string=this){
        return s.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
    }
    dashedToCamelCase(s=this){
        return s.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    } 
    regexec(...regex){
        const len = args.length; 
        const regexObject = {
          match : args[0],
          captured : args.slice(1,len-2),
          offset : args[len-2],
          string : args[len-1]
        }
        console.log(regexObject)
    }
    noSpace(){ 
        return new Str(this.replace(/  +/g, ' ').replaceAll(' ',''));
    }
    oneSpace(){
        return new Str(this.replace(/  +/g, ' '));
    }
    noDuplicateWords(){
        return this.replaceAll(/\b(\w+)\b(?=.*?\b\1\b)/ig,'')
    }
    map(...chars){
        for (let i = 0; i < chars.length-1; i+=2){
            this.replaceAll(chars[i],chars[i+1]);
        }
        return new Str(this); 
    }
    removeDup(toRemove){
            this.split(toRemove);
            this[0] = this[0] + toRemove;  
            return new Str(this.join('')); 
    }
    remove(...rest){
        for (let i in rest){
            this.replaceAll(rest[i],''); 
        }
        return new Str(this); 
    }
    findAndRemove(arr,toRemove){
        for (let s of arr){
            const newArr = s.replace(toRemove,'');
            this.replaceAll(s,newArr); 
        }
        return new Str(this); 
    }
    findAndReplace(arr,replacement){
        for (let s of arr){
            this.replace(s,replacement);  
        }
        return new Str(this);
    }
    substr(start,end){
        if (typeof start === 'number'){
            if (!this.includes(end)){
                return this; 
            }
            return new Str(this.slice(start,this.indexOf(end))+1);
        }
        else if (typeof end === 'number'){
            if (!this.includes(start)){
                return this; 
            }
            return new Str(this.slice(this.indexOf(start),end)+1); 
        }
        else {
            if (!this.includes(start)){
                return new Str(this); 
            }
            else if (!this.includes(end)){
                return new Str(this); 
            }
            return new Str(this.slice(this.indexOf(start),this.indexOf(end)+1)); 
        }
    }
    between(start,end){
        if (typeof start === 'number'){
            if (!this.includes(end)){
                return this; 
            }
            return new Str(this.slice(start+1,this.indexOf(end)));
        }
        else if (typeof end === 'number'){
            if (!this.includes(start)){
                return this; 
            }
            return new Str(this.slice(this.indexOf(start)+1,end)); 
        }
        else {
            if (!this.includes(start)){
                return new Str(this); 
            }
            else if (!this.includes(end)){
                return new Str(this); 
            }
            return new Str(this.slice(this.indexOf(start)+1,this.indexOf(end))); 
        }
    }
    // stack(ch1,ch2){
    //     if (ch2 == null){
    //         ch2 = (ch1=="(") ? ")" : (ch1=="[") ? "]" : (ch1=="{") ? "}" : ")";
    //     }
    //     let stk = 1; let ind = -1;
    //     thising = this.slice(this.indexOf(ch1)+1); 
    //     for (let i in thising){
    //         if (thising.charAt(i) == ch1){
    //             stk += 1;
    //         }
    //         if (thising.charAt(i) == ch2){
    //             stk -= 1; 
    //         }
    //         if (stk == 0){
    //             ind = i;
    //             break; 
    //         }
    //     }
    //     return new Str(thising.slice(0,ind));
    // }
    innerStack(ch1,ch2){
        if (ch2 == null){
            ch2 = (ch1=="(") ? ")" : (ch1=="[") ? "]" : (ch1=="{") ? "}" : ")";
        }
        while (this.includes(ch1)){
            new Str(this).stack(ch1,ch2).this; 
        }
        return new Str(this); 
    }
    capitalizeSentence(){
        let str = this._;
        let sentences = str.split('.');
        let updated = [];
        sentences.map( function (sentence) {
        if ( sentence ) {
            if ( sentence[0] !== ' ' ) {
            let output = sentence.charAt(0).toUpperCase() + sentence.slice(1);
            updated.push( output );
            }
            else {
            let output = sentence.charAt(1).toUpperCase() + sentence.slice(2);
            updated.push( ' ' + output );
            }
        }
        });
        let final = updated.join('.');
        if ( str.endsWith('.') ) {
        final += '.';
        }
        return new Str(final);
    }
// NUMBER returners
    numOf(char){
        return this.split(char).length - 1; 
    }
// ARR returners
    stackToList(char1,char2){

            const strArr = [this.slice(0,this.indexOf(char1)),
            this.slice(this.indexOf(char1)+1,this.indexOf(char2)),
            this.slice(this.indexOf(char2)+1)]
        
        return thisArr; 
    }
// BOOL returners
    equals(...rest){
        if (Array.isArray(rest[0])){
            rest = rest[0];
        }
        for (let i in rest){
            if(s === rest[i]){
                return true;
            }
        }
        return false;
    }
    hasAny(...rest){
        for (const subStr of rest){
            if (this.includes(subStr)){
                return true;
            }
        }
        return false; 
    }
    hasAll(...rest){
        for (const subStr of rest){
            if (!this.includes(subStr)){
                return false; 
            }
        }
        return true;
    }
    hasNone(...rest){
        for (const subStr of rest){
            if (this.includes(subStr)){
                return false; 
            }
        }
        return true;
    }
    hasStart(...rest){
        for (let i in rest){
            if(this.startsWith(rest[i])){
                return true;
            }
        }
        return false;
    }
    hasEnd(...rest){
        for (let i in rest){
            if(this.endsWith(rest[i])){
                return true;
            }
        }
        return false;
    }
    charAtEquals(index,char){
        return this.charAt(index) === char;
    }
    charAIncludes(index,...char){
        return char.includes(this.charAt(index));
    }
    camelCaseToDashed(string=this){
        return s.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
    }
    dashedToCamelCase(s=this){
        return s.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    } 
}

Object.assign(Str,{
    email : (s) => new RegExp(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/).test(s),
    password : {
        complex :  (s) =>   new RegExp(/(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/ ).test(s),
        moderate : s =>  new RegExp(/(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/).test(s)
    },
    username :  s =>  new RegExp(/^[a-z0-9_-]{3,16}$/).test(s),
    url :  s =>  new RegExp(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/).test(s),
    phone :  s =>  new RegExp(/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/igm).test(s),
    num : s =>  !isNaN(s),
    int : s =>  !isNaN(s) && Number.isInteger(parseFloat(s)),
    float : s =>  !isNaN(s) && !Number.isInteger(parseFloat(s)),
    array : s =>  Array.isArray(s),
});

const str = (s) => new Str(s);

export {Str,str}