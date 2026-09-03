 class CustomSelectScript {
  OnchangeTriggerChangeToAutoCorrection(e, setSelect, isCorrect) {
    setSelect((prevState) => ({
      ...prevState,
      value: e,
      is_correct: isCorrect,
      clearValue: false,
    }));
  }

 
}

export default CustomSelectScript;
