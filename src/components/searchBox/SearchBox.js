import React, { useState, useEffect } from "react";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import "./searchBox.css";

export default function SearchBox(props) {
  const [searchResults, setSearchResults] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [toggledSearchModes, setToggledSearchModes] = useState([]);
  const [searchModes, setSearchModes] = useState({});
  const [searchValue, setSearchValue] = useState("");

  const {
    Annotations,
    annotManager,
    docViewer,
    searchContainerRef,
    searchTermRef: searchTerm,
    updatePage,
  } = props;


  useEffect(() => {
    if (docViewer && docViewer.SearchMode) {
      const {
        SearchMode: {
          e_page_stop: ePageStop,
          e_highlight: eHighlight,
          e_case_sensitive: eCaseSensitive,
          e_whole_word: eWholeWord,
          e_ambient_string: eAmbientString,
        },
      } = docViewer;
      setSearchModes({
        ePageStop,
        eHighlight,
        eCaseSensitive,
        eWholeWord,
        eAmbientString,
      });
    }
  }, [docViewer]);

  /**
   * Coupled with the function `changeActiveSearchResult`
   */
  useEffect(() => {
    if (activeResultIndex >= 0 && activeResultIndex < searchResults.length) {
      docViewer.setActiveSearchResult(searchResults[activeResultIndex]);
      updatePage();
    }
  }, [activeResultIndex]);

  /**
   * Side-effect function that invokes `docViewer.textSearchInit`, and stores
   * every result in the state Array `searchResults`, and jumps the user to the
   * first result is found.
   */
  const performSearch = () => {
    clearSearchResults(false);
    const { ePageStop, eHighlight, eAmbientString } = searchModes;
    const mode = toggledSearchModes.reduce(
      (prev, value) => prev | value,
      ePageStop | eHighlight | eAmbientString
    );
    const fullSearch = true;
    let jumped = false;
    docViewer.textSearchInit(searchValue, mode, {
      fullSearch,
      onResult: (result) => {
        setSearchResults((prevState) => [...prevState, result]);
        const {
          resultCode,
          quads,
          // The page number in the callback parameter is 0-indexed
          page_num: pageNumber,
        } = result;
        const { e_found: eFound } = window.PDFNet.TextSearch.ResultCode;
        // const pageNumber = zeroIndexedPageNum + 1;
        if (resultCode === eFound) {
          const highlight = new Annotations.TextHighlightAnnotation();
          /**
           * The page number in Annotations.TextHighlightAnnotation is not
           * 0-indexed
           */
          highlight.setPageNumber(pageNumber);
          // highlight.Quads.push(quads[0].getPoints());
          if (quads.length && quads[0].getPoints) {
            highlight.Quads.push(quads[0].getPoints());
          }
          annotManager.addAnnotation(highlight);
          annotManager.drawAnnotations(highlight.PageNumber);
          if (!jumped) {
            jumped = true;
            // This is the first result found, so set `activeResult` accordingly
            setActiveResultIndex(0);
            docViewer.displaySearchResult(result, () => {
              /**
               * The page number in docViewer.displayPageLocation is not
               * 0-indexed
               */
              docViewer.displayPageLocation(pageNumber, 0, 0, true);
            });
          }
        }
      },
    });
  };

  /**
   * Side-effect function that invokes the internal functions to clear the
   * search results
   *
   * @param {Boolean} clearSearchTermValue For the guard clause to determine
   * if `searchTerm.current.value` should be mutated (would not want this to
   * occur in the case where a subsequent search is being performed after a
   * previous search)
   */
  const clearSearchResults = (clearSearchTermValue = true) => {
    if (clearSearchTermValue) {
      // searchTerm.current.value = '';
      setSearchValue("");
    }
    docViewer.clearSearchResults();
    annotManager.deleteAnnotations(annotManager.getAnnotationsList());
    setSearchResults([]);
    setActiveResultIndex(-1);
  };

  /**
   * Checks if the key that has been released was the `Enter` key, and invokes
   * `performSearch` if so
   *
   * @param {SyntheticEvent} event The event passed from the `input` element
   * upon the function being invoked from a listener attribute, such as
   * `onKeyUp`
   */
  const listenForEnter = (event) => {
    const { keyCode } = event;
    // The key code for the enter button
    if (keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      performSearch();
    }
  };

  /**
   * Changes the active search result in `docViewer`
   *
   * @param {Number} newSearchResult The index to set `activeResult` to,
   * indicating which `result` object that should be passed to
   * `docViewer.setActiveSearchResult`
   */
  const changeActiveSearchResult = (newSearchResult) => {
    // debugger;
    /**
     * @todo Figure out why only the middle set of search results can be
     * iterated through, but not the first or last results.
     */
    /**
     * Do not try to set a search result that is outside of the index range of
     * searchResults
     */
    if (newSearchResult >= 0 && newSearchResult < searchResults.length) {
      setActiveResultIndex(newSearchResult);
    }
  };

  return (
    <>
      <div className="search_pdf_input" ref={searchContainerRef}>
        <input
          // className='search_pdf_input'
          type="text"
          placeholder="Search"
          ref={searchTerm}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyUp={listenForEnter}
        />
        <SearchIcon className="search_icon" />
        <div className="more_search_options">
          <ClearIcon className="options_icon" onClick={clearSearchResults} />
          <ExpandLessIcon
            className="options_icon"
            onClick={() => changeActiveSearchResult(activeResultIndex - 1)}
          />
          <ExpandMoreIcon
            className="options_icon"
            onClick={() => changeActiveSearchResult(activeResultIndex + 1)}
          />
        </div>
      </div>
    </>
  );
}
