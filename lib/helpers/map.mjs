class ExtMap extends Map {
    constructor(){
        super()
    }
    valueAt(i){
        return Array.from(this.values())[i]
    }
    keyAt(i){
        return Array.from(this.keys())[i]
    }
    entryAt(i){
        return Array.from(this.entries())[i]
    }
}

export default ExtMap; 