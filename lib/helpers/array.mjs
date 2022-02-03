class ExtArray extends Array {
    constructor(...elems){
        super();
        elems.forEach(elem => this.push(elem));
    }
    replace(el,handler){
        let truth =false
        this.forEach((e,index)=>{
            if (handler.call(this,e,index)){
                truth = true; 
                this[index] = el; 
            }
        });
        if (!truth){
            this.push(el); 
        }
        return this; 
    }
    get(filter){
        for (let i in this){
            if (filter(this[i])){
                return this[i]
            }
        }
    }
}

export default ExtArray