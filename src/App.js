import React, { useRef, useEffect, useState } from 'react';
import SearchContainer from './components/SearchContainer';
// import zoomin from './assets/images/circleMinus.png';
import { Grid } from '@material-ui/core';
import { ReactComponent as FullWidth } from './assets/images/fullView.svg';
// import { ReactComponent as Zoom } from './assets/images/minus.svg';
import { ReactComponent as ZoomIn } from './assets/images/plusCircle.svg';
import { ReactComponent as ZoomOut } from './assets/images/minusCircle.svg';
import { ReactComponent as AnnotationRectangle } from './assets/icons/ic_annotation_square_black_24px.svg';
import { ReactComponent as AnnotationRedact } from './assets/icons/ic_annotation_add_redact_black_24px.svg';
import { ReactComponent as AnnotationApplyRedact } from './assets/icons/ic_annotation_apply_redact_black_24px.svg';
import { ReactComponent as Search } from './assets/icons/ic_search_black_24px.svg';
import { ReactComponent as Select } from './assets/icons/ic_select_black_24px.svg';
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);
  const pageInput = useRef(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [highlighToolSelected, setHighlightToolSelected] = useState(false);
  const [fitWidth, setFitWidth] = useState(false);

  const [docViewer, setDocViewer] = useState(null);
  const [annotManager, setAnnotManager] = useState(null);
  const [searchContainerOpen, setSearchContainerOpen] = useState(false);

  const Annotations = window.Annotations;

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const CoreControls = window.CoreControls;
    console.log(CoreControls);
    CoreControls.setWorkerPath('/webviewer');
    CoreControls.enableFullPDF(true);

    const docViewer = new CoreControls.DocumentViewer();
    const annotationManager = new CoreControls.AnnotationManager(docViewer);

    docViewer.setScrollViewElement(scrollView.current);
    docViewer.setViewerElement(viewer.current);
    docViewer.setOptions({ enableAnnotations: true, enableLeftPanel: ['bookmarksPanel', 'bookmarksPanelButton'] });
    docViewer.loadDocument('/files/duckett.pdf');

    setDocViewer(docViewer);
    pageInput.current.style.width = `${pageInput.current.value.length}ch`

    docViewer.on('documentLoaded', () => {
      setInputValue(docViewer.getCurrentPage())
      setTotalPages(docViewer.getPageCount())
      pageInput.current.style.width = `${pageInput.current.value.length}ch`
      // console.log('check', docViewer.getCurrentPage())

      docViewer.setToolMode(docViewer.getTool('AnnotationCreateSticky'));
      docViewer.setToolMode(docViewer.getTool('AnnotationCreateFreeText'));
      docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));

      setAnnotManager(docViewer.getAnnotationManager());

      docViewer.getDocument().getBookmarks().then((bookmarks) => {
        const pageIndexes = Object.keys(bookmarks).map(pageIndex => parseInt(pageIndex, 10));
        // console.log(bookmarks)

        const printOutlineTree = (item, level) => {
          const indent = ' '.repeat(level);
          const name = item.getName();
          console.log(indent + name);
          item.getChildren().map(b => printOutlineTree(b, level + 1));
        };

        bookmarks.map((root) => {
          printOutlineTree(root, 0);
        });

        setBookmarks(bookmarks[0].children);
      });

      // docViewer.getAnnotations().then((annotation) => {
      //   console.log(annotation);
      // const pageIndexes = Object.keys(bookmarks).map(pageIndex => parseInt(pageIndex, 10));
      // console.log(bookmarks)

      // const printOutlineTree = (item, level) => {
      //   const indent = ' '.repeat(level);
      //   const name = item.getName();
      //   console.log(indent + name);
      //   item.getChildren().map(b => printOutlineTree(b, level + 1));
      // };

      // bookmarks.map((root) => {
      //   printOutlineTree(root, 0);
      // });

      // setBookmarks(bookmarks[0].children);
      // });

      // debugger;
      // const highlight = new Annotations.TextHighlightAnnotation();
      // highlight.PageNumber = 1;
      // highlight.X = 405;
      // highlight.Y = 165;
      // highlight.Width = 275;
      // highlight.Height = 25;
      // highlight.StrokeColor = new Annotations.Color(255, 255, 0);
      // // you might get the quads from text selection, a server calculation, etc
      // highlight.Quads = [
      //   { x1: 644, y1: 178, x2: 682, y2: 178, x3: 682, y3: 168, x4: 644, y4: 168 },
      //   { x1: 408, y1: 190, x2: 458, y2: 190, x3: 458, y3: 180, x4: 408, y4: 180 }
      // ];

      // annotationManager.addAnnotation(highlight);
      // annotationManager.drawAnnotations(highlight.PageNumber);
    });
  }, []);

  const zoomOut = () => {
    docViewer.zoomTo(docViewer.getZoom() - 0.25);
  };

  const zoomIn = () => {
    docViewer.zoomTo(docViewer.getZoom() + 0.25);
  };

  const fitMode = () => {
    if(fitWidth){
      docViewer.setFitMode(docViewer.FitMode.FitPage)
    }else{
      // docViewer.setFitMode(docViewer.FitMode.FitPage)
      docViewer.setFitMode(docViewer.FitMode.FitWidth)
    }
    setFitWidth(!fitWidth)
  }

  const createHighlight = () => {
    highlighToolSelected ?
      docViewer.setToolMode(docViewer.getTool(window.Tools.ToolNames.HIGHLIGHT)) : docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
    setHighlightToolSelected(!highlighToolSelected);
  };

  const notesTool = () => {
    docViewer.setToolMode(docViewer.getTool(window.Tools.ToolNames.STICKY));
  };

  const selectTool = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
  };

  const createRedaction = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationCreateRedaction'));
  };

  const applyRedactions = async () => {
    const annotManager = docViewer.getAnnotationManager();
    annotManager.enableRedaction(true);
    await annotManager.applyRedactions();
  };

  const pageNavigaton = (e) => {
    e.preventDefault();
    docViewer.setCurrentPage(inputValue)
  }

  return (
    <div className="App">
      <div id="main-column">
        <Grid container className='custom_header'>
          <Grid item xs={3}></Grid>
          <Grid item xs={6} className='operations_header'>
            <div  id="tools">
              <form onSubmit={pageNavigaton} onBlur={pageNavigaton}>
                <span>Page: </span>
                <input
                  className='page_input'
                  ref={pageInput}
                  value={inputValue}
                  onChange={(e) => {
                    // e.target
                    console.log()
                    pageInput.current.style.width = `${pageInput.current.value.length}ch`
                    setInputValue(e.target.value)
                  }}
                  onBlur={pageNavigaton}
                /> / <span>{totalPages}</span>
              </form>
              <div className='zoom_buttons'>
                <button onClick={zoomIn}>
                  <ZoomIn />
                </button>
                <button onClick={zoomOut}>
                  <ZoomOut />
                </button>
              </div>
              <button onClick={fitMode}>
                <FullWidth />
              </button>

              {/* <button onClick={createHighlight}>
                <AnnotationRectangle />
              </button>
              <button onClick={notesTool}>
                <AnnotationRectangle />
              </button> */}

              {/*<button onClick={createRedaction}>
            <AnnotationRedact />
          </button>
          <button onClick={applyRedactions}>
            <AnnotationApplyRedact />
          </button>
          <button onClick={selectTool}>
            <Select />
          </button> */}

              {/* <button
                onClick={() => {
                  // Flip the boolean
                  setSearchContainerOpen(prevState => !prevState);
                }}
              >
                <Search />
              </button> */}

            </div>
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>





        {/* <div className='left-container'>abc</div>
          <div className='right-container'>abc</div> */}

        <div className="flexbox-container" id="scroll-view" ref={scrollView}>
          {/* <div>
            <ul>
              {bookmarks.map(b => {
                console.log(b);
                return (
                  <li onClick={() => {
                    docViewer.setCurrentPage(b.Ac + 1)
                  }}>{b.name}</li>
                )
              })}
            </ul>
          </div> */}
          {/* <div className="flexbox-container">
            <SearchContainer
              Annotations={Annotations}
              annotManager={annotManager}
              docViewer={docViewer}
              searchTermRef={searchTerm}
              searchContainerRef={searchContainerRef}
              open={true}
            />
          </div> */}
          <div id="viewer" ref={viewer}></div>
          {/* <div className="flexbox-container">
            <SearchContainer
              Annotations={Annotations}
              annotManager={annotManager}
              docViewer={docViewer}
              searchTermRef={searchTerm}
              searchContainerRef={searchContainerRef}
              open={true}
            />
          </div> */}
        </div>
      </div>

    </div>
  );
};

export default App;
