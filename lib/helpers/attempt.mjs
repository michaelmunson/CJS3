export default class Attempt {
    [Symbol.toPrimitive](hint) {
        return this.value; 
    }
    constructor(tryer,catcher=err=>{}){        
        this.passed = false;
        this.failed = false; 
        try {
            this.value = Reflect.apply(tryer,this,[]);
            this.passed = true;  
        }
        catch(e){
            this.failed = true; 
            this.passed = false;
            this.error = e; 
            this.value = Reflect.apply(catcher,this,[this.error])
        }
    }
    then(res=function(value=this.value){},err){
        if (this.passed){
            return new Try(res.bind(this),err) 
        }
        else {
            return Reflect.apply(res,this,[this.errorvalue,])
        }
    }
}