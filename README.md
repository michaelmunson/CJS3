<img src="./static/images/logo.png">

# CJS3 - Getting Started 
## Installation
```bash 
npm init CJS3 --save-dev
``` 

```javascript 
import CJS3 from "CJS3"
```
## Creating a new Stylesheet
- Stylesheets can be created through the new instances of the CJS3.Stylesheet class
```javascript 

const myStyles = new CJS3({
    'body' : {
        color : 'black',
        fontSize : '20px'
    }
    '.txt-green' : {
        color : 'green',
    }
});
myStyles.render()
```
## Selector Syntax
- Syntax is based off SCSS, and uses nesting to indicate relationships. 
### Selecting Descendants
``` javascript
header : {
    h1: {
        textAlign:'center'
    }
}
```
```css
/* CSS equivalent */
header h1 {
    text-align : center;
}
```
<hr>

### Selecting Children
``` javascript
header : {
    '> h1': {
        textAlign:'center'
    }
}
```
```css
/* CSS eqiuvalent */
header h1 {
    text-align : center;
}
```
### Selecting Element w/ ...
#### (classes & psuedo-selectors)
- '&' is used for denoting element.class 
``` javascript
header : {
    '&.text-center': {
        textAlign:'center'
    }
}
```
```css
/* CSS eqiuvalent */
header.text-center {
    text-align : center;
}
```
### Pseudo Selectors 
``` javascript
header : {
    color:'red'
    '&:hover' : {
        color:'green'
    }
}
```
```css
/* CSS eqiuvalent */
header {
    color : red;
}
header:hover{
    color:green;
}
```




## @Rules
### Keyframes
``` javascript
'@keyframes' : {
    fadeout : {
        0 : {
            opacity : 0
        },
        1 : {
            opacity : 1
        }
    },
    fadein : {
        from : {
            opacity : 1
        },
        to : {
            opacity : 0
        }
    }
}

```
```css
/* CSS equivalent */
@keyframes fadein {
    0% {
        opacity : 0
    }
    100% {
        opacity : 1
    }
}
@keyframes fadeout {
    from {
        opacity : 1
    }
    to {
        opacity : 0
    }
}
}
```

### Import 
```javascript
{
    '@import' : [
        'url(...)',
        'stylesheet.css',
    ]
}
```
``` css
/* CSS equivalent */
@import url(...);
@import 'stylesheet.css'
```

## Event Handlers
- Event Handlers can be created as well. 
- Styles returned by an event will be applied to the object. 
- This bound to event target.  
``` javascript
{
    button {
        color:'black',

        click(){
            if (!this.counter){
                this.counter = 0;
            }
            this.textContet = 
            `click # ${this.counter}`
            if (this.counter % 2 === 1){
                return {
                    color:'yellow'
                }
            }
            else {
                return {
                    color : 'green'
                }
            }
        }
    }
}
```