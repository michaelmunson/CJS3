import CJS3 from '../../../index';

CJS3.config = {
    global : {
        properties : true,
    },
    strict : true,
    onError(err){
        console.warn(err)
    }
};

const _ = 'initial';

const themes = new CJS3.Themes({
    active : 'dark',
    light : {
        $primColor:'white',
        $secColor : 'rgb(76,76,76)',
        $secColorFaded : 'rgba(76,76,76,.5)',
        $trimColor : 'dodgerblue',
    },
    dark : {
        $primColor:'midnightblue',
        $secColor : 'black',
        $secColorFaded : 'rgba(0,0,0,.5)',
        $trimColor : 'dodgerblue',
    }
});

const cjsProps = new CJS3.Properties({
    /* transition => arg0 + 'ms' */
    trans : {
        property : 'transition',
        value : (v = 300) => (isNaN(v)) ? v : v+'ms',
    },
    /* border-radius => arg0 + 'px' */
    bRad : {
        property : 'border-radius',
        value : (v=15) => v+'px',
    },
    /* height => arg0 */
    h : {
        property : 'height',
        value : (s='100%') => s
    },
    w : {
        property : 'width',
        value : (s='100%') => s
    },
    /* height => arg0 + 'px' */
    hPx : {
        property : 'height',
        value : (s=100) => s+'px'
    },
    /* width => arg0 + 'px' */
    wPx : {
        property : 'width',
        value : (s=100) => s + 'px'
    },
    /* width => arg0 + 'vw' */
    wVw : {
        property : 'width',
        value : (s=100) => s+'vw'
    },
    /* padding => arg0 + 'px' */
    p : {
        property : 'padding',
        value : (s=10) => (isNaN(s)) ? s : s+'px'
    },
    /* margin => arg0 + 'px' */
    m : {
        property : 'margin',
        value : (s=10) => (isNaN(s)) ? s : s+'px'
    },
    /* background => arg0 */
    bg : {
        property : 'background',
        value : (clr) => {
            return clr; 
        }
    },
    /* height,width => arg0,arg1 */
    h_w : {
        property : ['height','width'],
        value : (h='100%',w='100%') => {
            h = (isNaN(h)) ? h : h+'%';
            w = (isNaN(w)) ? w : w+'%';
            return [h,w]
        }
    },
    /* position,top,right,bottom,left => "absolute",arg0,arg1,arg2,arg3 */
    pos_abs : {
        property : ['position','top','right','bottom','left'],
        value : (top='initial',right='initial',bottom='initial',left='initial') => {
            return ['absolute',top,right,bottom,left]
        }
    },
    pos_fxd : {
        property : ['position','top','right','bottom','left'],
        value : (top='initial',right='initial',bottom='initial',left='initial') => {
            return ['fixed',top,right,bottom,left]
        }
    },
    /* font-size =>  */
    fszEm : {
        property : 'font-size',
        value : (f) => f+'em',
    },
});

const cssImports = new CJS3.StyleSheet({
    /* Define the id attribute for the rendered style tag */
    id : 'css-imports',
    /* Imports go in an array */
    '@import' : [
        "url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');",
        "url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css')"
    ],
});

const staticStyles = new CJS3.StyleSheet({
    id : 'static',
    ':root':{
        transition : '200ms',
        fontFamily : "'Montserrat', sans-serif",
    },
    'html, body' : {
        h:'100%',
        w:'100%',
        margin:'0px',
        transition : '200ms',
        overflow:'hidden'
    },
    'body' : {
        animation : 'onload 2s',
        animationFillMode : 'forwards !important',
        animationDelay : '.5s'
    },
    '@keyframes' : {
        onload :  {
            0 : {
                opacity : 0,
            },
            100 : {
                opacity : 1
            }
        },
        initSideBar : {
            0 : {
                w : '0%',
            },
            100 : {
                w : '12.5%'
            }
        }
    },
});

const cssMain = new CJS3(() => {
    return {
        '@media' :{},
        'html, body' : {
            background : `radial-gradient(${$primColor},${$secColor})`,
            backgroundRepeat : 'no-repeat',
        },
        '.rowflx':{
            display:'flex',
            flexFlow:'row nowrap',
            '.colflx' : {
                flex : '1 0 1',
            },
            '&.-vrtcnt' : {
                alignItems : 'center'
            },
        },
        '.container' : {
            ...trans,
            ...h_w,
            '.header' : {
                zIndex:3,
                hPx : 100,
                bg : $secColor,
                borderBottom : '5px solid '+$trimColor,
                '.brand' : {
                    p:15,
                    fszEm : 1.7,
                    '.brand-logo' : {
                        p:5,
                        color : $trimColor,
                        fszEm : 1.5,
                    },
                    '.brand-name' : {
                        color : white,
                        lineHeight: '0',
                        fszEm : 1.3,
                        m : 0,
                    },
                }
            },
            '.main' : {
                display : 'grid',
                gap:px(20),
                gridTemplateColumns :  'auto auto auto auto',
                h_w : ['100%','90vw'],
                width:'0px'
            },
            '.side-bar' : {
                animation : 'init-side-bar 1s',
                borderTop : '3px dotted '+$secColor,
                borderRight : '5px solid '+$trimColor,
                background : $secColor.replace(')',',.5)'),
                pos_fxd : ['100px',_,_,'0'],
                h : 100,
                transition:'1000ms ease, visibilty 0s',
                '&:hover' : {
                    wVw : 25,
                    background : $secColor,
                },
                
            }
        },
    }
});

console.log(cssMain)

export { cssMain, themes };

/*

'@media' : {
        'only screen and (min-width: 600px)':{
            '.container.dynamic-grid' : {
                display : 'grid',
                gridTempCol : (1),
                gap:px(0),
                gridAutoRows: '100px auto',
                // gridAutoColumns : 'auto auto auto '
            }
        },
        'only screen and (min-width: 800px)':{
            '.container.dynamic-grid' : {
                display : 'grid',
                gridTempCol : 2,
                gap:px(0),
                gridAutoRows: '100px auto',
            }
        },
        'only screen and (min-width: 850px)':{
            '.container.dynamic-grid' : {
                display : 'grid',
                // gridTemplateColumns : '80vw 20vw',
                gap:px(0),
                // gridAutoRows: '100px auto',
                gridAutoRows: '100px auto',
                gridAutoColumns : 'auto 100px'
                // gridAutoColumns: 'auto 100px'
            }
        },
        'only screen and (min-width: 1300px)':{
            '.container.dynamic-grid' : {
                display : 'grid',
                gap:px(0),
                gridAutoRows: '100px auto',
                gridTemplateColumns :  '85vw 15vw',
            }
        },
    },

CJS3.config.onError = () => {}; 

CJS3.properties = {
    bRad : {
        property : 'border-radius',
        value : (v=25) => v+'px'
    },
    txcnt : {
        property : 'text-align',
        value : () => 'center'
    }
}
const theme = {
    color : '#4300bb'
}
const stylesheet = new CJS3({
    '@import' : [
        "url('https://fonts.googleapis.com/css2?family=Inconsolata&display=swap')",
        "url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');"
    ],
    '@keyframes' : {
        flip : {
            0 : {
                transform : 'rotate3d(0,0,0,0)'
            },
            100 : {
                transform: 'rotate3d(0, 1, 0, 3.142rad)'
            }
        },
        confettiRain : {
            0 : {
              opacity: '1',
              marginTop: '-100vh',
              marginLeft: '-200px',
            },
            
            100 : {
              opacity: '1',
              marginTop: '100vh',
              marginLeft: '200px',
            }
        }
    },
    '.confetti' : {
        opacity: '0',
        position: 'absolute',
        width: '1rem',
        height: '1.5rem',
        animation: 'confettiRain 5s infinite',
      },
    'body' : {
        fontFamily : "'Montserrat', sans-serif",
    },
    '.container' : {
        display : 'grid',
        gridTemplateColumns : 'auto auto',
        gridColumnGap : '2vw',
        gridRowGap : '2vw',
        justifyContent : 'center'
    },
    '.card' : {
        width:"40vw",
    },
    '@media only screen and (max-width: 350px)': {
        '.card-name' : {
            position:'absolute',
            visibility:'hidden',
        }
    },
    '@media only screen and (min-width: 600px)' : {
        '.container' : {
            display : 'grid',
            gridTemplateColumns : 'auto auto auto ',
            gridColumnGap : '1vw',
            gridRowGap : '1vw',
            justifyContent : 'center',
            transition:'1000ms',
        },
        '.card' : {
            width:"29vw",
        },
        '.card-name' : {
            fontSize : '1em',
        }
    },
    '@media only screen and (min-width: 1000px)' : {
        '.container' : {
            display : 'grid',
            gridTemplateColumns : 'auto auto auto auto',
            gridColumnGap : '1vw',
            gridRowGap : '1vw',
            justifyContent : 'center',
            transition:'1000ms',
        },
        '.card' : {
            width:"22vw",
        },
        '.card-name' : {
            fontSize : '1.2em',
        }
    },
    '@media only screen and (min-width: 1400px)' : {
        '.container' : {
            display : 'grid',
            gridTemplateColumns : 'auto auto auto auto auto',
            gridColumnGap : '1vw',
            gridRowGap : '1vw',
            justifyContent : 'center'
        },
        '.card' : {
            width:"17vw",
            transition:'1000ms',
        },
        '.card-name' : {
            fontSize : '1.2em',
        }
    },
    '.header' : {
        padding : '0px 15px',
        display : 'grid',
        gridTemplateColumns : 'auto auto auto',
        gridColumn : '1 / 5',
        fontSize : '1.1em',
        '.collection-name' : {
            gridColumn : '1 / 3',
        },
        '.draw-card-button' : {
            margin : '15px 0px 15px auto',
            width : '150px',
            color:'white',
            fontSize : '1.3em',
            transition: '100ms',
            ...bRad,
            background : theme.color,
            gridColumn : '3 / 3',
            border : '0',
            ':hover' : {
                opacity : .9
            },
            zIndex : '300'
        },
        '.confirm-section' : {
            position: 'absolute',
            transform : 'translateX(400px)',
            transformOrigin : 'right',
            right:'26px',
            top : '38px',
            fontSize : '1.3em',
            '.text' : {...bRad,textDecoration:'underline'},
            '.confirm-yes' : {color:'white',background:'#0004ad',fontSize:'inherit',...bRad,padding:"3px 15px",borderRadius:'10px',border:'0px'},
            '.confirm-no' : {background:'darkred',color:white,border:'0px',fontSize:'inherit',padding:"3px 15px",borderRadius:'10px' }
        },
    },

    '.card-all' : {
        background : 'white',
        transition: '1000ms transform',
        border : '3px solid gray',
        alignSelf : 'center',
        ...bRad,
        overflow:'hidden',
        cursor : 'pointer',
        '&:hover' : {
            border : '3px solid '+theme.color,
        },
    },
    '.content-front' : {
        transitionDelay : '300ms',
        opacity : 1,
        '&.flipped' : {
            opacity : 0,
        },
        '.card-image' : {
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            maxHeight : '75%',
            width: '90%',
        },
        '.card-name' : {
            textAlign : 'center',
        },
    },
    '.content-back' : {
        padding : '20px',
        transform  : 'rotateY(180deg)',
        position:'absolute',
        height: '100%',
        transitionDelay : '300ms',
        opacity : 0,
        pointerEvents : 'none',
        '&.flipped' : {
            opacity : 1,
            transform  : 'rotateY(-180deg)',
        },
    },
    '.flip' : {
        transform : 'scale(1.3) rotateY(180deg)',
        zIndex : '100'
    },
    '.qmark' : {
        width:'25vh',
        position:'absolute',

    }

});

console.log(stylesheet);
export default stylesheet


*/