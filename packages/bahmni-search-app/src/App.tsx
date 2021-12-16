import React, { useState, useEffect } from 'react';
import { Search, ClickableTile } from './design-system';
import { search } from './api';
import { useAsync } from 'react-async';

const App = () => {
  const [textInput, setTextInput] = useState('');
  const [isTextInputAvailable, setIsTextInputAvailable] = useState(false);
  const {
    run: searchDrug,
    data: drugs,
    error: error,
  } = useAsync({
    deferFn: () => search(textInput),
    onReject: () => error ?? console.log('searchDrug Failed: Error fetching drug names'),
  });

  useEffect(() => {
    if (textInput.length > 1 && textInput.length < 17) {
      searchDrug();
    }
    textInput.length == 2 ? setIsTextInputAvailable(true) : setIsTextInputAvailable(!(textInput.length < 2));
  }, [textInput]);

  const handleTextInput = (e) => {
    setTextInput(e.target.value);
  };

  const clearTextInput = () => {
    setTextInput('');
    setIsTextInputAvailable(false);
  };

  const selectDrug = (e) => {
    console.log(e.target.outerText);
    setTextInput(e.target.outerText);
  };

  const renderClickableTile = () => {
    if (drugs && isTextInputAvailable) {
      return drugs.results.map((drug) => (
        <ClickableTile key={drug.uuid} onClick={(e) => selectDrug(e)}>
          {drug.name}
        </ClickableTile>
      ));
    }
  };

  return (
    <div>
      <Search
        id="search"
        labelText="SearchDrugs"
        onChange={(e) => handleTextInput(e)}
        onClear={() => clearTextInput()}
        value={textInput}
      />
      {renderClickableTile()}
    </div>
  );
};

export default App;
