

import { useEffect, useRef } from 'react';

const callBackFunctions = {};
let callBackIDStack = [];

let backButtons = null;
let element = document;
let event = 'keypress';


const isKeyBackButton = (e) => (backButtons || []).indexOf(e.keyCode) !== -1;

/* --------------------------------- NOTICE ------------------------------------
  The callback function passed to backButtonController should return true if
  the propogation of function to be terminated at that level. By deafult it will
  keep on progating through all callback Functons registered.
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

const addNewCallbackToStack = ({ randomID, callback = () => {}, rank = null } = {}) => {
  if (getRandomIDArray().indexOf(randomID) === -1) {
    const lastCallbackIDStackItem = callBackIDStack[callBackIDStack.length - 1];
    if (rank && lastCallbackIDStackItem && lastCallbackIDStackItem.rank !== null) {
      updateCallBackIDStackwithRank(randomID, rank);
    } else {
      callBackIDStack.push({ randomID, rank });
    }
  }
  callBackFunctions[randomID] = callback;
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
    stopPropogation = backFunction();
    if (!(stopPropogation === true)) executeBackPressFunctionality(parentLevel + 1);
  }
};

const handleBackPress = (event) => {
  if (isKeyBackButton(event)) {
    executeBackPressFunctionality();
  }
};

export const enableBackButtonHandler = () => element.addEventListener(event, handleBackPress);

export const removeBackButtonHandler = () => {
  element.removeEventListener(event, handleBackPress);
};

const useBackButton = ({ callback, rank = null, randomID: rID }) => {
  const randomID = useRef(rID || Math.random());
  addNewCallbackToStack({
    randomID: randomID.current,
    callback,
    rank,
  });
  useEffect(() => () => { removeCallBack(randomID.current); }, []);
};

export const initialize = ({ keyCodes = [], element: elm = document, event: ev = 'keypress' }) => {
  const initializeFunc = () => {
    enableBackButtonHandler();
    backButtons = keyCodes;
    element = elm;
    event = ev
    return () => {
      removeBackButtonHandler()
    }
  }
  useEffect(initializeFunc, [])
}

export default useBackButton;
