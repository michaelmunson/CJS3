import { str } from "../../helpers.mjs";
import lexicon from "./lexicon.mjs";

class Color {
    static colors = lexicon.colors; 
    static Hex = class Hex extends String {
        constructor(hex){
            if (hex.startsWith('rgb')){
                return new Color.RGB(hex); 
            }
            super(hex.toString());
            try {
                const rgb = Color.hexToRgb(hex.toString());
                this.r = rgb.r; 
                this.g = rgb.g;
                this.b = rgb.b;
            }
            catch(e){
                throw new Error('Invalid Hex String') 
            }
            
            // this.rgb = new Color.RGB(rgb.r,rgb.g,rgb.b); 
        }
        get rgb(){
            return new Color.RGB(this.r,this.g,this.b);
        }
        get hex(){
            return this; 
        }
    }
    static RGB = class RGB extends String {
        constructor(r,g,b,o=1){
            super(("rgb("+[r,b,g,o]+")").replaceAll(" ","")); 
            this.r = r; 
            this.g = g;
            this.b = b;
            this.o = o;  
        }
        toString(){
            return ("rgb("+[this.r,this.g,this.b]+")").replaceAll(" ","")
        }
        get hex(){
            return Color.rgbToHex(this.r,this.g,this.b); 
        }
        get rgb(){
            return this; 
        }
    }
    constructor(...color){
        if (typeof color === "string"){color=color.replaceAll(" ","")}
        if (color.length === 3){
            return new Color.RGB(color[0],color[1],color[2]); 
        }
        else if (color.length === 4){
            return new Color.RGB(color[0],color[1],color[2],color[3]); 
        }
        else {
            color = color[0]; 
        }
        if (color.startsWith("rgb")){
            let s = str(color).stack("(",")").str.split(",").map(e=>parseInt(e.trim()));
            return new Color.RGB(s[0],s[1],s[2]); 
        }
        else if (color.startsWith("#")){
            return new Color.Hex(color); 
        }
    }
    static hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        hex = (hex.toString()); 
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
        });
      
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          toString(){
              return `rgb(${this.r},${this.g},${b})`
          }
        } : null;
    }
    static rgbToHex(r, g, b) {
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    static compare(c1,c2){
        
        try {
            c1 = new Color(c1); 
            c2 = new Color(c2);

            return (c1.hex.toString() == c2.hex.toString())
        }
        catch(e){
            return false; 
        }
    }
    static rgb = (r,g,b,o) => new Color.RGB(r,g,b,o);
    static hex = (color) => new Color.Hex(color);
    static type = (...color) => {
        if (color.length > 1 || color[0].startsWith('rgb')){
            return Color.RGB
        }
        else if (color[0].startsWith('#')){
            return Color.Hex
        }
        else if (color[0] in Color.colors){
            return Color.colors; 
        }
    }
}

Object.assign(Color,lexicon.colors)

export default Color; 