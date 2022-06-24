import { useEffect, useRef } from 'react';

let backButtons = null;
// let element = document;
// let event = 'keypress';

const callBackFunctions = {};
let callBackIDStack = [];

window.callBackFunctions = callBackFunctions;
window.callBackIDStack = callBackIDStack;

export const initialize = ({ keyCodes = [], element: elm = document, event: ev = 'keypress' }) => {
    if(!backButtons) {
        backButtons = keyCodes;
    }
    // element = elm;
    // event = ev
};

const isKeyBackButton = (e) => (backButtons || []).indexOf(e.keyCode) !== -1;

/* --------------------------------- NOTICE ------------------------------------
  The callBack function passed to backButtonController should return true if
  the propogation of function to be terminated at that level. By deafult it will
  keep on progating through all callBack Functons registered.
  ------------------------------------------------------------------------------ */

const getRandomIDArray = () => callBackIDStack.map((i) => i.randomID) || [];

const updateCallBackIDStackwithRank = (randomID, rank) => {
  let tempRankArray = callBackIDStack.map((i) => i.rank) || [];
  const filteredRankArrr = [];
  const filteredIDStack = [];

  const rankFilter = (i) => {
    const correspondingRankItem = tempRankArray[i] || null;
    const correspondingIdItem = callBackIDStack[i] || null;
    if (correspondingRankItem !== null) {
      filteredRankArrr.unshift(correspondingRankItem);
      filteredIDStack.unshift(correspondingIdItem);
      rankFilter(i - 1);
    }
  };
  rankFilter(tempRankArray.length - 1);

  filteredRankArrr.push(rank); // Adding new rank
  filteredIDStack.push({ randomID, rank }); // Adding new ID Object

  const sortedRankArray = filteredRankArrr.sort((a, b) => a - b);
  const newSortedIdArray = [];
  sortedRankArray.forEach((Rank) => {
    newSortedIdArray.push(filteredIDStack.filter(({ rank: r }) => r === Rank)[0]);
  });

  const croppedIDArray = callBackIDStack.slice(0, (callBackIDStack.length - newSortedIdArray.length) + 1);
  const croppedRankArr = tempRankArray.slice(0, (tempRankArray.length - sortedRankArray.length) + 1); // Need only for debugging
  callBackIDStack = [...croppedIDArray, ...newSortedIdArray];
  tempRankArray = [...croppedRankArr, ...sortedRankArray]; // Need only for debugging
};

/** ------------------------ */

const addNewCallbackToStack = ({ randomID, callBack = () => {}, rank = null } = {}) => {
  if (getRandomIDArray().indexOf(randomID) === -1) {
    const lastCallbackIDStackItem = callBackIDStack[callBackIDStack.length - 1];
    if (rank && lastCallbackIDStackItem && lastCallbackIDStackItem.rank !== null) {
      updateCallBackIDStackwithRank(randomID, rank);
    } else {
      callBackIDStack.push({ randomID, rank });
    }
  }
  console.log('@@addingtostack', randomID, callBack)
  callBackFunctions[randomID] = callBack;
};

const removeCallBack = (randomID) => {
  if (!randomID) {
    callBackIDStack = [];
  }
  const indexOfCurrentCallback = getRandomIDArray().indexOf(randomID);
  if (indexOfCurrentCallback > -1) {
    callBackIDStack.splice(indexOfCurrentCallback, 1);
    delete callBackFunctions[randomID];
  }
};

const executeBackPressFunctionality = (parentLevel = 0) => {
  const index = getRandomIDArray().length - (parentLevel + 1);
  const callBackFunctionKey = callBackIDStack[index] && callBackIDStack[index].randomID;
  const backFunction = callBackFunctions[callBackFunctionKey];
  let stopPropogation = false;
  if (backFunction && typeof backFunction === 'function') {
    console.log('## EBBF - Current', backFunction)
    stopPropogation = backFunction();
    if (!(stopPropogation === true)) {
        console.log('## EBBF - Next')
        executeBackPressFunctionality(parentLevel + 1)
    };
  }
};

const handleBackPress = (event) => {
    console.log('## Handling back press BEOFER: ', event)
    if (isKeyBackButton(event)) {
      console.log('## Handling back press AFTER: ', event)
    executeBackPressFunctionality();
  }
};

console.log('#### Adding eventlistner')
document.addEventListener('keydown', handleBackPress);

export const removeBackButtonHandler = () => {
  document.removeEventListener('keydown', handleBackPress);
};

export const useInitialize = (prop) => {
  const initFunc = () => {
    console.log('### initializing package')

    initialize(prop);
    // enableBackButtonHandler();
  }
  useEffect(initFunc,[])
}

const useBackButton = ({ callBack, rank = null, randomID: rID }) => {
  const randomID = useRef(rID || Math.random());
  console.log('@@randomID', randomID.current);
  console.log('Adding New Callback function', randomID)
  addNewCallbackToStack({
    randomID: randomID.current,
    callBack,
    rank,
  });
  useEffect(() => () => { removeCallBack(randomID.current); console.log('## unmounting a componenet') }, []);
};
export default useBackButton;
