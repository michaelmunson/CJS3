
import evaluator from "./evaluator.mjs"
import { str } from "./str.mjs";
import { css } from "../css.mjs";

class ElementList {    
    constructor(elem){
        this.isElement = true; 
        this.nodes = (typeof elem == "string") ? [...document.querySelectorAll(elem)]: elem;
        if (!Array.isArray(this.nodes)){
            this.nodes = [this.nodes];
        }
        if (elem == "document"){
            this.nodes = [document]; 
        }
        else if (elem == "window"){
            this.nodes = [window]; 
        }
        for (let i in this.nodes){
            this[i] = this.nodes[i]; 
        }
        this.node = this[0]; 
        this.__init__();
        
    }
    // MISC 
        // remove((node) => someFilter); 
    remove(filter){
        this.nodes.forEach(node => {
            if(filter(elem(node))){
                node.remove(); 
            }
            // node.remove();
        });
    }
    query(selector){
        return this.node.querySelectorAll(selector);
    }
    find(selector){
        return this.node.querySelectorAll(selector);
    }
    // CSS
    css(...rest){
        this.nodes.forEach(node => {
            
            rest.forEach(s => {
                for (let i in s){
                    const prop = str(i).dashedToCamelCase(); 
                    node.style[prop] = s[i]; 
                } 
            });
        });
        return this; 
    }
    // BOOLEANS
        // takes a selector
    has(select){
        console.log(select);
        let sel = select;
        if (select.includes('(')){
            sel = new str(sel).innerStack('(',')');
            if (sel.includes('||')){
                select = select.replace(sel,this.any(sel));
            }
            else if (sel.includes('&&')){
                select = select.replace(sel,this.all(sel));
            }
            select = select.replaceAll('(true)','true').replaceAll('(false)','false');
        }
        else {
            if (sel.includes('||')){
                select = select.replace(sel,this.any(sel));
            }
            else if (sel.includes('&&')){
                select = select.replace(sel,this.all(sel));
            }
            else {
                select = select.replace(sel,this.any(sel));
            }
            select = select.replaceAll('(true)','true').replaceAll('(false)','false');
        }
        if (((new str(select).numOf('||')) + (new str(select).numOf('&&'))) == 0){
            return evaluator(select).evaluate();;
        }
        return this.has(select); 
    }
        any(select){
            const truth = [];
            select =  (select.includes('||')) ? select.split('||') : [select]; 
            select.forEach(selector => {
                selector = selector.trim(); 
                this.nodes.forEach(node => {

                    if (selector.includes('.')){
                        truth.push(node.classList.contains(selector.slice(1))); 
                    }
                    else if (selector.includes('[')){
                        let sel = new str(selector).stack('[',']').split('=');
                        if (sel.length == 1){
                            truth.push(node.getAttribute(sel[0]) != null); 
                        }
                        else {
                            truth.push(node.getAttribute(sel[0]) == sel[1]); 
                        }
                    }
                    else if (selector == "true" || selector == "(true)"){
                        truth.push(true)
                    }
                    else if (selector == "false" || selector == "(false)"){
                        truth.push(false);
                    }
                });
            });
            return truth.includes(true); 
        }
        all(select){
            const truth = [];
            select =  (select.includes('&&')) ? select.split('&&') : [select]; 
            select.forEach(selector => {
                selector = selector.trim(); 
                this.nodes.forEach(node => {
                    if (selector.includes('.')){
                        truth.push(node.classList.contains(selector.slice(1))); 
                    }
                    else if (selector.includes('[')){
                        let sel = new str(selector).stack('[',']').split('=');
                        if (sel.length == 1){
                            truth.push(node.getAttribute(sel[0]) != null); 
                        }
                        else {
                            truth.push(node.getAttribute(sel[0]) == sel[1]); 
                        }
                    }
                    if (selector == "true" || selector == "(true)"){
                        truth.push(true)
                    }
                    if (selector == "false" || selector == "(false)"){
                        truth.push(false);
                    }
                });
            });
            return (!truth.includes(false));
        }
    inView(){
        const isInView = []
        this.nodes.forEach(
            node => {
                const rect = node.getBoundingClientRect();
                const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
                const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
                const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
                const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

                isInView.push(vertInView && horInView);
            }
        );
        return (isInView.length > 1) ? isInView : isInView[0];
    }
    // HELPERS
    attr(attr,...rest){
        let attrList = [];
        let attrMap = new Map(); 
        this.nodes.forEach(node => {
            if (attr == null){
                attrList.push({...node.attributes}) 
                attrMap.set(node,node.attributes);
            }
            else if(rest == null || rest.length == 0){
                attrList.push(node.getAttribute(attr));
                attrMap.set(node,node.getAttribute(attr));
            } 
            else {
                node.setAttribute(attr,rest[0]); 
            }
        });
        // console.log(attrMap);
        return (attrMap.size > 1) ? attrMap : attrMap[0];
    }
    val(val){
        const v = []; 
        this.nodes.forEach(node => {
            if (val == null){
                v.push(node.value); 
            }
            else {
                node.value = val; 
            }
        });
        if (val == null){
            return (v.length == 1) ? v[0] : v;
        }
        return this;
    }
    styleProxy () {
        let cssDec = {
            nodes : this
        };  
        const cssDec3Proxy = new Proxy(cssDec, {
            set: function (target, key, value) { 
            for (let i in target.nodes){
                try{
                    if (target.nodes[i]["style"] != null){
                        target.nodes[i]["style"][key] = value;
                    }
                }
                catch(e){
                    console.error(e);
                }
            }
            return true;
        },
        });
        this.style = cssDec3Proxy; 
        return cssDec3Proxy;    
    }; 
    // DATA FUNCTIONS
    parent(ret){
        const pars = []; 
        this.nodes.forEach(node => {
            if (ret != null){
                pars.push(node.parentElement);
            }
            else {
                pars.push(elem(node.parentElement));
            }
            
        });
        return (pars.length > 1) ? pars : pars[0]; 
    }
    children(ret="*"){
        if (Array.isArray(ret)){
            ret = ret[0];
        }
        const pars = [];
        let cRet = false;
        this.nodes.forEach(node => {
            [...node.childNodes].forEach(child => {
                if (ret != null){
                    if (ret.length > 1){
                        const nodeLs = [...node.querySelectorAll(ret)];
                        nodeLs.forEach(childNode => {
                            if (child == childNode){
                                if (cRet){
                                    pars.push(childNode);
                                }
                                else {
                                    pars.push(elem(childNode)); 
                                }
                            }
                        }); 
                    }
                    else {
                        pars.push(child);
                    }
                }
                else {
                    pars.push(elem(child));
                }
                
            })
        });
        return (pars.length > 1) ? pars : pars[0];
    }
    x(...rest){
        const xs = []; 
        this.nodes.forEach(node => {
            if (rest.length > 0){
                node.style.position = "absolute"; 
                node.style.left = rest;
            }
            else {
                xs.push(node.offsetLeft);
            }
        });
        return (xs.length == 1) ? xs[0] : xs;
    }
    y(...rest){
        const ys = [];
        this.nodes.forEach(node => {
            if (rest.length > 0){
                node.style.position = "absolute"; 
                node.style.top = rest;
            }
            else {
                ys.push(node.offsetTop);
            }
        });
        return (ys.length == 1) ? ys[0] : ys;
    }
    width(...rest){
        const ws = []; 
        this.nodes.forEach(node => {
            if (rest.length > 0){
                node.style.width = rest; 
            }
            else {
                ws.push(node.offsetWidth);
            }
        });
        return (ws.length == 1) ? ws[0] : ws;
    }
    height(...rest){
        const hs = []; 
        this.nodes.forEach(node => {
            if (rest.length > 0){
                node.style.height = rest; 
            }
            else {
                hs.push(node.offsetHeight);
            }
        });
        return (hs.length == 1) ? hs[0] : hs;
    }
    getCSS(){
        const stysArr = []; 
        this.nodes.forEach(node => {
            const stys = {};
            for (let s in window.getComputedStyle(node)){
                if (isNaN(s)){
                    stys[s] = window.getComputedStyle(node)[s];
                }
            }
            stysArr.push(stys)
        });
        return (stysArr.length == 1) ? stysArr[0] : stysArr;
    }
    // CLASS & ATTRIBUTES
    class(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        this.nodes.forEach(node => {
            str.forEach(cls => {
                if (cls.charAt(0) == '+'){
                    this.addClass(cls.slice(1));
                }
                if (cls.charAt(0) == '-'){
                    this.removeClass(cls.slice(1));
                }
                if (cls.charAt(0) == '?'){
                    this.toggleClass(cls.slice(1));
                }
                if (cls.charAt(0) == '/'){
                    this.shiftClass(cls.slice(1));
                }
                if (cls.charAt(0) == '!'){
                    this.replaceClass(cls.slice(1));
                }
            });
        });
        return this;
    }
    addClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            this.nodes.forEach(node => {
                node.classList.add(c); 
            });
        });
        return this;
    }
    removeClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            this.nodes.forEach(node => {
                node.classList.remove(c); 
            });
        }); 
        return this;
    }
    toggleClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            this.nodes.forEach(node => {
                node.classList.toggle(c); 
            });
        });
        return this;
    }
    shiftClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            document.querySelectorAll('*').forEach(el => {
                el.classList.remove(c);
            });
        });
        str.forEach(cls => {
            this.nodes[0].classList.add(cls);
        });
        return this;
    }
    replaceClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        let [oldCls,newCls] = str.replaceAll(' ','').split(','); 
        this.nodes.forEach(node => {
            node.classList.replace(oldCls,newCls);
        });
        return this;
    }
    // HTML
    append(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('beforeend',html);  
        });
        return this;
    }
    prepend(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('beforebegin',html); 
        });
        return this;
    }
    after(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('afterend',html);  
        });
        return this;
    }
    before(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('beforebegin',html);  
        });
        return this;
    }
    html(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        const h = []; 
        this.nodes.forEach(node => {
            if (html == null){
                h.push(node.innerHTML); 
            }
            else {
                node.innerHTML = html; 
            }
        });
        if (h.length == 0){
            return this;
        }
        return (h.length == 1) ? h[0] : h;
    }
    text(text){
        if (Array.isArray(text)){
            text = text[0]; 
        }
        const h = []; 
        this.nodes.forEach(node => {
            if (text == null){
                h.push(node.textContent); 
            }
            else {
                node.textContent = text; 
            }
        });
        if (h.length == 0){
            return this;
        }
        return (h.length == 1) ? h[0] : h;
    }
    // EVENTS
    on(eventStr, callback){
        if (Array.isArray(eventStr)){eventStr = eventStr.join(' ')}
        const eventArray = eventStr.split(' '); 
        eventArray.forEach(e => {
            this.nodes.forEach(el => {
                el.addEventListener(e,function(){
                    callback.call(this);
                });
            });
        });
        return this; 
    }
    animate(cssObj,options={duration:1000,fill:'forwards'}){
        console.log(cssObj)
        if (typeof cssObj === "string"){
            cssObj = Object.values(cjs3.keyframes[cssObj]); 
        }
        else if (!Array.isArray){
            cssObj = Object.values(cssObj)
        }
        
        this.nodes.forEach(node => node.animate(cssObj,options)); 
    }
        fadeOut(duration = 1000){
            this.animate(
                [{opacity : 0}],{
                fill : 'forwards',
                duration,
            });
        }
        fadeIn(duration = 1000){
            this.animate(
                [{opacity : 1}],{
                fill : 'forwards',
                duration,
            });
        }
    draggable(subEl) {
        this.nodes.forEach(node => {
            if (subEl == ''){
                subEl = null;
            }
            if (node.getAttribute('canDrag') == true){
                return;
            }
            else {
                node.setAttribute('canDrag',true);
            }
            let elmnt = node;
            elmnt.style.top = elmnt.offsetTop + "px";
            elmnt.style.left = elmnt.offsetLeft + "px";
            elmnt.style.position = "absolute";
            elmnt.style.margin = "0px"; 
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (subEl != null) {
                // if present, the header is where you move the DIV from:
                elmnt.querySelector(subEl).onmousedown = dragMouseDown;
                elmnt.querySelector(subEl).style.cursor = 'move';
            } else {
                // otherwise, move the DIV from anywhere inside the DIV:
                elmnt.onmousedown = dragMouseDown;
            }
            
            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            
            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }
            
            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        });
    }
    resetNode(withChildren) {
        this.nodes.forEach(el => {
            if (withChildren) {
                el.parentNode.replaceChild(el.cloneNode(true), el);
            }
            else {
                let newEl = el.cloneNode(false);
                while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
                el.parentNode.replaceChild(newEl, el);
            }
        });
        return this;
    }
    observe(observerObject){
        /**
        observerObjectExample = {
            attributes : function(mutation){
                console.log(mutation)
            }
        }
        */
        const observers = new Map(); 
        this.nodes.forEach(node => {
            const config = {
                attributes : Object.keys(observerObject).includes("attributes"),
                childList : Object.keys(observerObject).includes("childList"),
                subtree : Object.keys(observerObject).includes("subtree")
            }; 
            const callbacks = observerObject; 
            const targetNode = node;
            const callback = function(mutationsList, observer) {
                for(const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        callbacks.childList(mutation);
                    }
                    if (mutation.type === 'attributes') {
                        callbacks.attributes(mutation);
                    }
                    if (mutation.type === 'subtree') {
                        callbacks.subtree(mutation);
                    }
                }
            };
            const observer = new MutationObserver(callback);
            observers.set(node,observer);
            observer.observe(targetNode, config);
        });
        return observers; 
    }
    __init__(){
        try {
            this.styleProxy();
            //let protos = Object.getOwnPropertyNames(HTMLElement.prototype).filter(x=> x.slice(0,2) != "on" && !x.includes('aria') && !(Object.getOwnPropertyNames(cjs3.prototype).includes(x))).filter(p => p!=='style');
            let protos = Object.getOwnPropertyNames(HTMLElement.prototype);
            protos.forEach(proto => {
                let builtin = []; 
                this.nodes.forEach(node => {
                    if (node[proto] instanceof Function){
                        ElementList.prototype[proto] = function(someval){
                            let found = [];
                            this.nodes.forEach(n => {
                                found.push(n[proto](someval)); 
                            }); 
                            return (found.length > 1) ? found : found[0]; 
                        }
                        builtin = 'function';
                    }
                    else {
                        builtin.push(node[proto]);
                    }
                });
                if (builtin !== 'function'){
                    builtin = (builtin.length > 0) ? builtin : [null]
                    this[proto] = (this.nodes.length > 1) ? builtin : builtin[0];
                }
            });
        }
        catch(e){
            console.log(e)
        }
    }
    static Static = {
        css(node,styles){
            return elem(node).css(styles);
        },
        text(node,txt){
            const n = elem(node); 
            return n.text(txt);
        },
        html(node,html){
            return elem(node).html(html); 
        },
        append(node,html){
            return elem(node).append(html);
        },
        prepend(node,html){
            return elem(node).prepend(html);
        },
        attr(node,attr,attrVal){
            return elem(node).attr(attr,attrVal);
        },
        val(node,value,newValue){
            return elem(node).val(value,newValue);
        },
        class(node,clsList){
            return elem(node).class(clsList);
        },
        addClass(node,clsList){
            return elem(node).addClass(clsList);
        },
        removeClass(node,clsList){
            return elem(node).removeClass(clsList);
        },
        toggleClass(node,clsList){
            return elem(node).toggleClass(clsList);
        },
        shiftClass(node,clsList){
            return elem(node).shiftClass(clsList);
        },
        replaceClass(node,clsList){
            return elem(node).replaceClass(clsList);
        },
        after(node,html){
            return elem(node).after(html);
        },
        before(node,html){
            return elem(node).before(html);
        },
        on(node,eventStr,callback){
            return elem(node).on(eventStr,callback);
        },
        animate(node,animObj){
            return elem(node).animate(animObj);
        },
        x(node,pos){
            return elem(node).x(pos);
        },
        y(node,pos){
            return elem(node).y(pos);
        },
        parent(node,ret){
            return elem(node).parent(ret);
        },
        getChildren(node,ret){
            return elem(node).children(ret);
        },
        fadeOut(node,duration=1000){
            return elem(node).fadeOut(duration);
        },
        fadeIn(node,duration=1000){
            return elem(node).fadeIn(duration);
        },
    }
}

const elem = e => new ElementList(e)

export {elem, ElementList}



/**
 * class $ {
    constructor(elem){
        super(); 
        this.nodes = (typeof elem == "string") ? [...document.querySelectorAll(elem)]: elem;
        
        if (!Array.isArray(this.nodes)){
            this.nodes = [this.nodes];
        }
        if (elem == "document"){
            this.nodes = [document]; 
        }
        else if (elem == "window"){
            this.nodes = [window]; 
        }
        for (let i in this.nodes){
            this[i] = this.nodes[i]; 
        }
        this.node = this[0]; 
        this.isElement = !this.node.nodeName.startsWith('#'); 

        this.nodes.forEach(node => {
            const methods = [analyzer(node).methods.filter(a => !(a in $Node.Static)),...Object.getOwnPropertyNames(HTMLElement.prototype)].filter(a => node[a] !== null);
            if (this.nodes.length === 1){
                methods.forEach(method => {
                    this[method] = node[method]; 
                });
            }
            else {
                methods.filter(m => (typeof node[m] === 'function')).forEach(method => {
                    this[method] = node[method]; 
                }); 
            }
        }); 
        this.__init__()           
        return new Proxy(this,{
            get: function (target, prop, receiver) {
                if (!Object.getOwnPropertyNames(Element.prototype).includes(prop) && prop in CJSStyleObject.properties) {
                  return target.node.style[prop];
                }
                
                return Reflect.get(...arguments);
            },
            set : function(t,k,v){
                t[k] = v;
                if (k in CJSStyleObject.properties){
                    t.nodes.forEach(node => {
                        node.style[k] = v;  
                    }) 
                }
                return true;   
            }
        });
    }
    // MISC 
        // remove((node) => someFilter); 
    remove(filter){
        this.nodes.forEach(node => {
            if (typeof filter === "function"){
                if(filter(CJSStyleObject.$(node))){
                    node.remove(); 
                }
            }
        });
    }
    query(selector){
        return this.node.querySelectorAll(selector);
    }
    $query(selector){
        return [...this.node.querySelectorAll(selector)].map(e => CJSStyleObject.$(e));
    }
    // CSS
    css(...rest){
        this.nodes.forEach(node => {
            rest.forEach(s => {
                const a = analyzer(s);
                if (a.isStr){
                    s = s.split(':').map(e => e.trim())
                    const [prop,val] = s;
                    node.style[str(prop).dashedToCamelCase()] = val; 
                }
                else if (a.isStrictObj){
                    for (let i in s){
                        const prop = str(i).dashedToCamelCase(); 
                        node.style[prop] = s[i]; 
                    } 
                }
                
            });
        });
        return this; 
    }
    has(...selectors){
        for (let q of selectors) {
            const a = analyzer(q); 
            if (a.isStr){
                q = [q]; 
            }
            if (Array.isArray(q)){
                for (let s of q){
                    if (s.toString().startsWith('!')){
                        s = s.slice(1)
                        if (this.query(s).length === 0){
                            return true
                        }
                    }
                    else {
                        if (this.query(s).length > 0){
                            return true
                        }
                    }
                    
                }
            }
            else {
                throw new Error('selector(s) must be String or Array')
            }
        }
        return false; 
    }
    hasAll(...selectors){
        for (let q of selectors) {
            const a = analyzer(q); 
            if (a.isStr) {
                q = [q]; 
            }
            if (Array.isArray(q)){
                for (let s of q){
                    if (s.toString().startsWith('!')){
                        s = s.slice(1)
                        if (this.query(s).length !== 0){
                            return false
                        }
                    }
                    else {
                        if (this.query(s).length === 0){
                            return false
                        }
                    }    
                }
            }
            else {
                throw new Error('selector(s) must be String or Array')
            }
        }
        return true; 
    }
    // BOOLEANS
        // takes a selector

    inView(){
        const isInView = []
        this.nodes.forEach(
            node => {
                const rect = node.getBoundingClientRect();
                const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
                const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
                const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
                const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
                isInView.push(vertInView && horInView);
            }
        );
        return (isInView.length > 1) ? isInView : isInView[0];
    }
    // HELPERS
    attr(...rest){
        const attrs = new Map();
        this.nodes.forEach(node => {
            if (rest.length === 0){
                return attrs.set(node,node.attributes); 
            }
            else if (rest.length === 1){
                const attr = rest[0]; 
                return attrs.set(node,node.attributes[0].value); 
            }
            else if (rest.length === 2){
                node.setAttribute(rest[0],rest[1])
            }
        });
        return (attrs.size === 1) ? [...attrs.values()][0] : attrs; 
    }
    val(...rest){
        const vals = new Map();
        this.nodes.forEach(node => {
            if (rest.length === 0){
                return vals.set(node,node.getAttribute('value')); 
            }
            else if (rest.length === 1){
                node.setAttribute('value',rest[0])
            }
        });
        return (vals.size === 1) ? [...vals.values()][0] : vals;
    } 
    // DATA FUNCTIONS
    parent(ret){
        const pars = []; 
        this.nodes.forEach(node => {
            pars.push(CJSStyleObject.$(node.parentElement));
        });
        return (pars.length > 1) ? pars : pars[0]; 
    }
    children(filter){
        const pars = new Map();
        this.nodes.forEach(node => {
            const childs = [...node.childNodes]; 
            if (filter){
                let validChilds = []; 
                if (typeof filter === 'function'){
                    childs.forEach(child => {
                        const $child = CJSStyleObject.$(child); 
                        if (typeof filter === 'function'){
                            if (filter.call($child,$child)){
                                validChilds.push($child)
                            }
                        }
                    });
                }
                if (typeof filter === 'string'){
                    validChilds = [...childs].filter(e => [...this.query(filter)].includes(e)).map(e=>CJSStyleObject.$(e))
                }
                pars.set(node,validChilds.filter(e => e.isElement));
            }
            else {
                pars.set(node,childs.map(e => CJSStyleObject.$(e)).filter(e => e.isElement));
            }
        });
        return (pars.size > 1) ? pars : [...pars.values()][0];
    }
    x(...rest){
        const xs = []; 
        this.nodes.forEach(node => {
            if (rest.length > 0){
                node.style.position = "absolute"; 
                node.style.left = rest;
            }
            else {
                xs.push(node.offsetLeft);
            }
        });
        return (xs.length == 1) ? xs[0] : xs;
    }
    y(...rest){
        const ys = [];
        this.nodes.forEach(node => {
            if (rest.length > 0){
                node.style.position = "absolute"; 
                node.style.top = rest;
            }
            else {
                ys.push(node.offsetTop);
            }
        });
        return (ys.length == 1) ? ys[0] : ys;
    }
    width(w){
        const ws = new Map(); 
        w = (typeof w === 'number')? w+"px" : w.toString();
        this.nodes.forEach(node => {
            if (w){
                node.style.width = w; 
            }
            else {
                ws.set(ws,node.offsetWidth);
            }
        });
        return (ws.length == 1) ? ws[0] : ws;
    }
    height(h){
        const hs = new Map(); 
        h = (typeof h === 'number')? h+"px" : h.toString(); 
        this.nodes.forEach(node => {
            if (h){
                node.style.height = h;  
            }
            else {
                hs.set(node,node.offsetHeight);
            }
        });
        return (hs.length == 1) ? hs[0] : hs;
    }
    getCSS(){
        const stysArr = []; 
        this.nodes.forEach(node => {
            const stys = {};
            for (let s in window.getComputedStyle(node)){
                if (isNaN(s)){
                    stys[s] = window.getComputedStyle(node)[s];
                }
            }
            stysArr.push(stys)
        });
        return (stysArr.length == 1) ? stysArr[0] : stysArr;
    }
    // CLASS & ATTRIBUTES
    class(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        this.nodes.forEach(node => {
            str.forEach(cls => {
                if (cls.charAt(0) == '+'){
                    this.addClass(cls.slice(1));
                }
                if (cls.charAt(0) == '-'){
                    this.removeClass(cls.slice(1));
                }
                if (cls.charAt(0) == '?'){
                    this.toggleClass(cls.slice(1));
                }
                if (cls.charAt(0) == '/'){
                    this.shiftClass(cls.slice(1));
                }
                if (cls.charAt(0) == '!'){
                    this.replaceClass(cls.slice(1));
                }
            });
        });
        return this;
    }
    addClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            this.nodes.forEach(node => {
                node.classList.add(c); 
            });
        });
        return this;
    }
    removeClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            this.nodes.forEach(node => {
                node.classList.remove(c); 
            });
        }); 
        return this;
    }
    toggleClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            this.nodes.forEach(node => {
                node.classList.toggle(c); 
            });
        });
        return this;
    }
    shiftClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        str = str.trim().replaceAll('.','').split(' '); 
        str.forEach(c => {
            document.querySelectorAll('*').forEach(el => {
                el.classList.remove(c);
            });
        });
        str.forEach(cls => {
            this.nodes[0].classList.add(cls);
        });
        return this;
    }
    replaceClass(str){
        if (Array.isArray(str)){
            str = str[0]; 
        }
        let [oldCls,newCls] = str.replaceAll(' ','').split(','); 
        this.nodes.forEach(node => {
            node.classList.replace(oldCls,newCls);
        });
        return this;
    }
    // HTML
    append(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('beforeend',html);  
        });
        return this;
    }
    prepend(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('beforebegin',html); 
        });
        return this;
    }
    after(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('afterend',html);  
        });
        return this;
    }
    before(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        this.nodes.forEach(node => {
            node.insertAdjacentHTML('beforebegin',html);  
        });
        return this;
    }
    html(html){
        if (Array.isArray(html)){
            html = html[0]; 
        }
        const h = []; 
        this.nodes.forEach(node => {
            if (html == null){
                h.push(node.innerHTML); 
            }
            else {
                node.innerHTML = html; 
            }
        });
        if (h.length == 0){
            return this;
        }
        return (h.length == 1) ? h[0] : h;
    }
    text(text){
        if (Array.isArray(text)){
            text = text[0]; 
        }
        const h = []; 
        this.nodes.forEach(node => {
            if (text == null){
                h.push(node.textContent); 
            }
            else {
                node.textContent = text; 
            }
        });
        if (h.length == 0){
            return this;
        }
        return (h.length == 1) ? h[0] : h;
    }
    // EVENTS
    on(eventStr, callback){
        if (Array.isArray(eventStr)){eventStr = eventStr.join(' ')}
        const eventArray = eventStr.split(' '); 
        eventArray.forEach(e => {
            this.nodes.forEach(el => {
                el.addEventListener(e,function(){
                    callback.call(this);
                });
            });
        });
        return this; 
    }
    animate(cssObj,options={duration:1000,fill:'forwards'}){
        
    }
    draggable(subEl) {
        this.nodes.forEach(node => {
            if (subEl == ''){
                subEl = null;
            }
            if (node.getAttribute('canDrag') == true){
                return;
            }
            else {
                node.setAttribute('canDrag',true);
            }
            let elmnt = node;
            elmnt.style.top = elmnt.offsetTop + "px";
            elmnt.style.left = elmnt.offsetLeft + "px";
            elmnt.style.position = "absolute";
            elmnt.style.margin = "0px"; 
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (subEl != null) {
                // if present, the header is where you move the DIV from:
                elmnt.querySelector(subEl).onmousedown = dragMouseDown;
                elmnt.querySelector(subEl).style.cursor = 'move';
            } else {
                // otherwise, move the DIV from anywhere inside the DIV:
                elmnt.onmousedown = dragMouseDown;
            }
            
            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            
            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }
            
            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        });
    }
    resetNode(withChildren) {
        this.nodes.forEach(el => {
            if (withChildren) {
                el.parentNode.replaceChild(el.cloneNode(true), el);
            }
            else {
                let newEl = el.cloneNode(false);
                while (el.hasChildNodes()) {
                    newEl.appendChild(el.firstChild);
                    el.parentNode.replaceChild(newEl, el);
                }
            }
        });
        return this;
    }
    observe(observerObject){
        
        const observers = new Map(); 
        this.nodes.forEach(node => {
            const config = {
                attributes : Object.keys(observerObject).includes("attributes"),
                childList : Object.keys(observerObject).includes("childList"),
                subtree : Object.keys(observerObject).includes("subtree")
            }; 
            const callbacks = observerObject; 
            const targetNode = node;
            const callback = function(mutationsList, observer) {
                for(const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        callbacks.childList(mutation);
                    }
                    if (mutation.type === 'attributes') {
                        callbacks.attributes(mutation);
                    }
                    if (mutation.type === 'subtree') {
                        callbacks.subtree(mutation);
                    }
                }
            };
            const observer = new MutationObserver(callback);
            observers.set(node,observer);
            observer.observe(targetNode, config);
        });
        return observers; 
    }
    __init__(){
        this.nodes.forEach(node => {
            const methods = [analyzer(node).methods,...Object.getOwnPropertyNames(Node.prototype)].filter(a => !Object.getOwnPropertyNames($Node.prototype).includes(a));
            methods.filter(m => (typeof node[m] === 'function')).forEach(method => {
                let fn$ = function(...params){
                    const returned = new Map(); 
                    this.nodes.forEach(node => {
                        const r = node[method].apply(node,params)
                        returned.set(node,r)
                    }); 
                    return returned
                };
                this[method] = fn$.bind(this)
            }); 
            if (this.nodes.length === 1){
                methods.filter(m => (typeof node[m] !== 'function')).forEach(prop => {
                    this[prop] = this.node[prop]; 
                })
            }
        });
        return this; 
    }
    static Static = {
        css(node,styles){
            return CJSStyleObject.$(node).css(styles);
        },
        text(node,txt){
            const n = CJSStyleObject.$(node); 
            return n.text(txt);
        },
        html(node,html){
            return CJSStyleObject.$(node).html(html); 
        },
        append(node,html){
            return CJSStyleObject.$(node).append(html);
        },
        prepend(node,html){
            return CJSStyleObject.$(node).prepend(html);
        },
        attr(node,attr,attrVal){
            return CJSStyleObject.$(node).attr(attr,attrVal);
        },
        val(node,value,newValue){
            return CJSStyleObject.$(node).val(value,newValue);
        },
        class(node,clsList){
            return CJSStyleObject.$(node).class(clsList);
        },
        addClass(node,clsList){
            return CJSStyleObject.$(node).addClass(clsList);
        },
        removeClass(node,clsList){
            return CJSStyleObject.$(node).removeClass(clsList);
        },
        toggleClass(node,clsList){
            return CJSStyleObject.$(node).toggleClass(clsList);
        },
        shiftClass(node,clsList){
            return CJSStyleObject.$(node).shiftClass(clsList);
        },
        replaceClass(node,clsList){
            return CJSStyleObject.$(node).replaceClass(clsList);
        },
        after(node,html){
            return CJSStyleObject.$(node).after(html);
        },
        before(node,html){
            return CJSStyleObject.$(node).before(html);
        },
        on(node,eventStr,callback){
            return CJSStyleObject.$(node).on(eventStr,callback);
        },
        animate(node,animObj){
            return CJSStyleObject.$(node).animate(animObj);
        },
        x(node,pos){
            return CJSStyleObject.$(node).x(pos);
        },
        y(node,pos){
            return CJSStyleObject.$(node).y(pos);
        },
        parent(node,ret){
            return CJSStyleObject.$(node).parent(ret);
        },
        getChildren(node,ret){
            return CJSStyleObject.$(node).children(ret);
        },
        fadeOut(node,duration=1000){
            return CJSStyleObject.$(node).fadeOut(duration);
        },
        fadeIn(node,duration=1000){
            return CJSStyleObject.$(node).fadeIn(duration);
        },
    }
}
 */
