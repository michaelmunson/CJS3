import { str } from '../../helpers.mjs';
const data = require('../data/css-data.json');

for (let i in data.properties){
    data.properties.value = (v) => (v) ? v : ""; 
}

const lexicon = {
    events : {
        hasName(name){
            return this.names.includes(name); 
        },

    },
    config : {
        globals : {
            colors : true,
            properties : false,
            units : false,
        },
        strict : {
            selector : false,
            declaration: false,
        },
        selectors : {}
    },
    ...data,
    pseudoRegex : /(active)|(anyLink)|(autofill)|(blank)|(checked)|(current)|(default)|(defined)|(dir)|(disabled)|(empty)|(enabled)|(first)|(firstChild)|(firstOfType)|(fullscreen)|(future)|(focus)|(focusVisible)|(focusWithin)|(has)|(host)|(hostContext)|(hover)|(indeterminate)|(inRange)|(invalid)|(is)|(lang)|(lastChild)|(lastOfType)|(left)|(link)|(localLink)|(not)|(nthChild)|(nthCol)|(nthLastChild)|(nthLastCol)|(nthLastOfType)|(nthOfType)|(onlyChild)|(onlyOfType)|(optional)|(outOfRange)|(past)|(pictureInPicture)|(placeholderShown)|(paused)|(playing)|(readOnly)|(readWrite)|(required)|(right)|(root)|(scope)|(state)|(target)|(targetWithin)|(userInvalid)|(valid)|(visited)|(where)|(after)|(backdrop)|(before)|(cue)|(cueRegion)|(firstLetter)|(firstLine)|(fileSelectorButton)|(grammarError)|(marker)|(part)|(placeholder)|(selection)|(slotted)|(spellingError)|(targetText)/g
}

lexicon.events.isJSEvent = function(eventName){
    return lexicon.events.includes(eventName); 
}

lexicon.events.isDOMEvent = function(eventName){
    return lexicon.events.includes(eventName); 
}

const selectors = {}

Object.keys(lexicon.selectors).forEach(s => {
    delete lexicon.selectors[s]
    const orig = s
    s = s.replaceAll(/(\:|\(|\))*/g,"")
    const jssel = str(s).dashedToCamelCase(); 
    selectors[jssel] = orig;
});
Object.assign(lexicon.selectors,selectors);


export default lexicon

