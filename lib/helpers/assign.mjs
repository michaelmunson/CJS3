/* eslint-disable prefer-reflect */
const argMap = (args,argfn) => {
    const called = argfn(args)[args.length]
    return called; 
}
const assign = (assignee={},assigner={},filter=o=>true) => {
    function getMethods(obj=assigner){
        const properties = new Set()
        let currentObj = obj; 
        do {
            // eslint-disable-next-line prefer-reflect
            Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
        }   while ((currentObj = Object.getPrototypeOf(currentObj)))
        return [...properties.keys()].filter(item => typeof obj[item] === 'function')
    }
    const force = Mapper.config.force; 
    const assignerMethods = getMethods(assigner);
    const assignmentKeys = Reflect.ownKeys(assigner).filter(filter); 
    if (Mapper.config.includeMethods){
        for (const methodName in assignerMethods){
            assignee[methodName] = assigner[methodName]
        }
    }
    for (const a in assignmentKeys){
        assignee[assignmentKeys[a]] = 
            (assignee[assignmentKeys[a]]===null && !force) 
                ? assignee[assignmentKeys[a]]
                : assigner[assignmentKeys[a]]; 
    }
    return assignee; 
}
class Mapper {
    static map(assignee={},assigner={},filter=o=>true){
        return assign(assignee,assigner,filter); 
    }
    static config(object){
        for (const key in object){
            Mapper.config[key] = object[key]; 
        }
        return {...Mapper.config}; 
    }
    constructor(object={},config={force:false}){
        this.assignee = object;
        Mapper.config(config);
        return this.assign.bind(this); 
    }
    assign(assigner,filter=o=>true){
        return Mapper.map(this.assignee,assigner,filter); 
    }
    keys(each=(key,index)=>{}){
        Object.keys(this.assignee).forEach((key,index) => {
            Reflect.apply(each,this,[key,index]); 
        }); 
        return this; 
    }
    values(each=(value,index)=>{}){
        Object.values(this.assignee).forEach((value,index) => {
            Reflect.apply(each,this,[value,index]); 
        }); 
        return this; 
    }
    entries(each=(key,value,index)=>{}){
        Object.values(this.assignee).forEach((key,value,index) => {
            Reflect.apply(each,this,[key,value,index]); 
        }); 
        return this; 
    }
}
Mapper.config({
    force : false,
    methods : false
});
Mapper.assign = assign;
const Global = new Mapper(global); 

const Assign = {
    Global,
    Mapper,
    argMap,
    assign,
}

export {Global,Mapper,assign,argMap,}
export default Assign