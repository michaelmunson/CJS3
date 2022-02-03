const random = {
    utf16 : {
        numbers : [48,57],
        specialChar : [[33,47],[58,64],[91,96]],
        letters : {upper : [65,90], lower : [97,122]},
    },
    chars : {
        braces : "{}[]()",
        upper : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lower : "abcdefghijklmnopqrstuvwxyz",
        get all(){
            return this.upper + this.letter; 
        },
        get alphanumeric(){
            return this.all + "0123456789"
        },
    },
    numeric(length=10,connector=""){
        let number=[];
        for (let i = 0; i < length; i++){
            number.push(random.randomInt(10)); 
        };
        return number.join(connector); 
    },
    alphanumeric(length,connector=""){
        let number=[];
        for (let i = 0; i < length; i++){
            const alpha = this.chars.alphanumeric; 
            const num = random.randomInt(this.chars.alphanumeric.length);
            number.push(alpha.charAt(num)); 
        };
        return number.join(connector);
    },
    noLimit(length,excludeArray=[],connector=""){
        let number=[];
        for (let i = 0; i < length; i++){
            const alpha = this.chars.alphanumeric; 
            let num = random.randomInt(33,126);
            number.push(String.fromCharCode(num)); 
        };
        function exclude(arr){
            arr.forEach((n,i) => {
                if (excludeArray.includes(n)){
                    arr[i] = String.fromCharCode(random.randomInt(33,126));
                }
            });
            for (let i in arr){
                if (excludeArray.includes(arr[i])){
                    return exclude(arr);
                }
            }
            return arr; 
        }
        number = exclude(number);
        return number.join(connector);
    },
    randomInt(min=Number.MAX_SAFE_INTEGER,max){
        if (max==null){
            max=min;
            return Math.floor(Math.random() * max);
        }
        else {
            return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
        }
    },
    randomFloat(min=Number.MAX_SAFE_INTEGER,max){
        if (max==null){
            max=min;
            return (Math.random() * max);
        }
        else {
            return (Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
        }
    },
}
export default random