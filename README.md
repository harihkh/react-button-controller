**react-button-controller** is a lightweight, fully-featured ReactJS package for handling a particluar key(s) press globally throughout the app. Some typical use cases are,

 - Handling back button press in case of TV apps.
 - Handling back button press in case of Webview mobile apps.
 - Handling Esc key press for navigation & closing popup in web apps.

> This package is currently supported upto **React 17.x.x**. Support of
> React 18 will be released soon.


## Installation

    npm i react-button-controller
## Initialization
The library need to be initialized with the keycodes for which the library need to listen for. Initialization can be done with the `useInitialize` hook. A typical place to do this is in the App.jsx of your react app. The hook accepts an obect as parameter with an array of `keyCodes` to listen for.

Here is an exapmle of initializing the library for listening to **Esc key** press.

      

    import React from  'react';
    import { useInitialize } from  'react-button-controller';
    
    function  App() {
    
	    useInitialize({ keyCodes: [27] });
	    // Initializing controller with "esc" key
	   
	    return (<div></div>);
	};
    
    export  default  App;

## Using Controller in a Component
The controller can be used in a react component using the `useButton` hook from the library. The hook accepts an object as parameter which contain the following properties.

 1. `callback` : The callback function that will be executed when the key press is handled for that component.
 2. `id`: A unique ID passed to the controller. This need to be unique throughout the app.

Whenever a component which has the controller is mounted, the library will add the callback to a call-stack. The addition to the call-stack is done in the order of the mounting of the components.
When the configured button is pressed, By default all the callback functions are triggered in the last-in-first-out manner. 

If you want to stop propogation of the action through the stack, `return false;` from the desired callback function. *(behaviour is similar to the event.stopPropogation() in JS)*.

## Example
Here is an example react app where we have two popups in the following order.

    App.jsx > MainPopup.jsx > InnerPopup.jsx

Here is the code of adding controller to **App.jsx - for closing MainPopup.jsx** and to **MainPopup.jsx - for closing InnerPopup.jsx**

**App.jsx**

    import React, { useState } from  'react';
    import useButton, { useInitialize } from  'react-button-controller'
    import MainPopup from  './MainPopup';
    import  './App.css';
    
    function  App() {
    
	    useInitialize({ keyCodes: [27] });
	    // Initializing controller with "esc" key
	    
	    const [showMainPopup, setShowMainPopup] =  useState(true);
	 
	    const  handleEsc  = () => {
		    setShowMainPopup(false)
		    return  false;
	    }
	    
	    useButton({ callback: handleEsc, randomID: 'app.js' });
	    
	    return (<div  className="App">
		    {showMainPopup  &&  <MainPopup  />}
	    </div>);
	    
    }
    
    export  default  App;

**MainPopup.jsx**

    import React, { useState } from  "react";
    import useButton from  "react-button-controller";
    import InnerPopup from  './InnerPopup'

    const  MainPopup  = () => {
    
	    const [showInnerPopup, setShowInnerPopup] =  useState(true);
	    
	    const  handleEsc  = () => {
		    if(showInnerPopup) {
			    setShowInnerPopup(false)
			    return  false;
		    }
	    };
	    
	    useButton({ callback: handleEsc, randomID: 'mainPopup'});
	    
	    return(<div  className="mainpopup">
		    --MainPopup--
		    {showInnerPopup  &&  <InnerPopup  />}
		    </div>)
    };
    
    export  default  MainPopup;
**InnerPopup.jsx**

    import React from  "react";
    
    const  InnerPopup  = () => {
	    return(<div  className="inner-popup">
		    --InnerPopup--
		    </div>)
    }
    
    export  default  InnerPopup;

Here is the Result.

![](https://media1.tenor.com/images/e80bd836e44091ba47d26213269569f4/tenor.gif?itemid=26049274)

Thanks for using this library. If you face any issue please raise a [Github issue](https://github.com/harihkh/react-button-controller/issues/new). 

Happy Coding !!!