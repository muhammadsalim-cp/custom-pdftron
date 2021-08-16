import React, { useRef, useEffect, useState } from 'react';
import SearchContainer from './components/SearchContainer';
// import zoomin from './assets/images/circleMinus.png';
import { Grid } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { ReactComponent as FullWidth } from './assets/images/fullView.svg';
import logo2 from './assets/images/headerLogo.png';
import logo1 from './assets/images/logo1.png';
import { ReactComponent as ZoomIn } from './assets/images/plusCircle.svg';
import { ReactComponent as ZoomOut } from './assets/images/minusCircle.svg';
import { ReactComponent as AnnotationRectangle } from './assets/icons/ic_annotation_square_black_24px.svg';
import { ReactComponent as AnnotationRedact } from './assets/icons/ic_annotation_add_redact_black_24px.svg';
import { ReactComponent as AnnotationApplyRedact } from './assets/icons/ic_annotation_apply_redact_black_24px.svg';
import { ReactComponent as Search } from './assets/icons/ic_search_black_24px.svg';
import { ReactComponent as Select } from './assets/icons/ic_select_black_24px.svg';
import './App.css';
import { NotInterestedTwoTone } from '@material-ui/icons';

var nest = 0;

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);
  const pageInput = useRef(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [displayBookmarks, setDisplayBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [highlighToolSelected, setHighlightToolSelected] = useState(false);
  const [fitWidth, setFitWidth] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(true)

  const [docViewer, setDocViewer] = useState(null);
  const [annotManager, setAnnotManager] = useState(null);
  const [searchContainerOpen, setSearchContainerOpen] = useState(false);

  const Annotations = window.Annotations;

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const CoreControls = window.CoreControls;
    const docViewer = new CoreControls.DocumentViewer();

    CoreControls.setWorkerPath('/webviewer');
    CoreControls.enableFullPDF(true);

    docViewer.setScrollViewElement(scrollView.current);
    docViewer.setViewerElement(viewer.current);
    docViewer.setOptions({ enableAnnotations: true, enableLeftPanel: ['bookmarksPanel', 'bookmarksPanelButton'] });
    docViewer.loadDocument('/files/romeo-and-juliet.pdf');
    // docViewer.loadDocument('/files/duckett.pdf');


    setDocViewer(docViewer);
    pageInput.current.style.width = `${pageInput.current.value.length}ch`

    docViewer.on('documentLoaded', () => {
      setCurrentPage(docViewer.getCurrentPage())
      setTotalPages(docViewer.getPageCount())
      pageInput.current.style.width = `${pageInput.current.value.length}ch`

      docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));

      setAnnotManager(docViewer.getAnnotationManager());

      docViewer.getDocument().getBookmarks().then((bookmarks) => {

        // const printOutlineTree = (item, level) => {
        //   const indent = ' '.repeat(level);
        //   const name = item.getName();
        //   console.log(indent + name);
        //   item.getChildren().map(b => printOutlineTree(b, level + 1));
        // };

        // bookmarks.map((root) => {
        //   printOutlineTree(root, 0);
        // });

        console.log('bookmarks in useEffect', bookmarks)
        setDisplayBookmarks(showBookmarks(bookmarks))

        setBookmarks(bookmarks);
      });
    });
    // docViewer.addEventListener('annotationAdded', () => console.log(`1`));
  }, []);

  // useEffect(()=>{
  //   if(docViewer){
  //     docViewer.addEventListener('annotationAdded',(annotations, action) => {
  //       console.log(1)
  //     })
  //   }
  // }, [docViewer])

  const showBookmarks = (list, level = 0) => {
    const bookmarksFormated = [];
    list.forEach((b, i) => {
      bookmarksFormated.push({ name: b.name, page: b.Ac, level: level, end: false });
      if (b.children.length > 0) {
        const subs = showBookmarks(b.children, level + 1);
        subs.forEach((s, n) => {
          bookmarksFormated.push(s)
        });
      } else {
        let last = bookmarksFormated.splice(-1).pop()
        bookmarksFormated.push({ ...last, end: true })
      }
    });
    console.log('list', bookmarksFormated)
    return bookmarksFormated;
  }

  const zoomOut = () => {
    docViewer.zoomTo(docViewer.getZoom() - 0.25);
  };

  const zoomIn = () => {
    docViewer.zoomTo(docViewer.getZoom() + 0.25);
  };

  const fitMode = () => {
    if (fitWidth) {
      docViewer.setFitMode(docViewer.FitMode.FitPage)
    } else {
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

  const pageNavigaton = (e) => {
    e.preventDefault();
    docViewer.setCurrentPage(currentPage)
  }



  return (
    <div className="App">
      <div id="main-column">
        <Grid container alignItems='center' className='custom_header'>
          <Grid item md={3} xs={6} className='left_header'>
            <div className='book_info'>
              <img className='book_thumbnail' src={logo1} alt='logo1' />
              <div className='book_name'>Signaalanalyse</div>
            </div>
          </Grid>
          <Grid item md={6} xs={12} className='operations_header'>
            <div id="tools">
              <form onSubmit={pageNavigaton} onBlur={pageNavigaton}>
                <span>Page: </span>
                <input
                  className='current_page_input'
                  ref={pageInput}
                  value={currentPage}
                  onChange={(e) => {
                    pageInput.current.style.width = `${pageInput.current.value.length}ch`
                    setCurrentPage(e.target.value)
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
          <Grid item md={3} xs={6} className='right_header'>
            <div>
              <img className='pdf_logo' src={logo2} alt='logo1' />
            </div>
          </Grid>
        </Grid>

        <div className="flexbox-container" id="scroll-view" ref={scrollView}>
          <div className='side_container left'>
            <div className='search_pdf_input'>
              <input
                // className='search_pdf_input'
                type='text'
                placeholder='Search'
                value={searchValue}
                onChange={(e) => { setSearchValue(e.target.value) }}
              />
              <SearchIcon className='search_icon' />
            </div>
            <div className='bookmarks_container'>
              <div className='main_bookmarks_container'>
                <div className='bookmarks_heading' onClick={() => setIsContentOpen(!isContentOpen)}>Contents <ArrowDropUpIcon className={`carrot_icon ${!isContentOpen && 'close'}`} /> </div>
                {
                  isContentOpen &&
                  <>
                    {/* {console.log('return',showBookmarks(bookmarks))} */}
                    {/* <ShowBookmarks items={bookmarks} /> */}

                    {/* {bookmarks.map(bookmark=>showBookmarks(bookmark))} */}

                    {displayBookmarks.map(marks => {
                      if (marks.end) {
                        return (
                          <li 
                            onClick={()=>docViewer.setCurrentPage(marks.page)}
                            className='subItem'
                            style={{ marginLeft: `calc(24px * ${marks.level})` }}
                          > 
                            {marks.name} 
                          </li>
                        );
                      } else {
                        return (
                          <div
                            onClick={()=>docViewer.setCurrentPage(marks.page)}
                            className='bookmarks_subheading'
                            style={{ marginLeft: `calc(24px * ${marks.level})` }}
                          >
                            {marks.name}
                          </div>
                        );
                      }
                    })}


                    {/* <div className='bookmarks_subheading'>Chapter 1. Esssentials</div>
                    <div className='bookmarks_subheading'>Chapter 2. Intro to new Science</div>
                    <div className='bookmarks_subheading'>Chapter 3. Time and space</div>
                    <div className='bookmarks_subheading nested_subheading'>Chapter 4. Main laws</div>
                    <ul className='subItem_container'>
                      <li className='subItem'>Chapter 4. 1. The first mention</li>
                      <li className='subItem'>Chapter 4. 2. Hypotheses</li>
                      <li className='subItem'>Chapter 4. 3. Hypotheses</li>
                    </ul>
                    <div className='bookmarks_subheading'>Chapter 1. Esssentials</div>
                    <div className='bookmarks_subheading'>Chapter 1. Esssentials</div>
                    <div className='bookmarks_subheading'>Chapter 1. Esssentials</div>
                    <div className='bookmarks_subheading'>Chapter 5. Conclusion</div>
                    <div className='bookmarks_subheading'>Chapter 6. Esssentials 2</div> */}


                  </>
                }
              </div>
            </div>
          </div>
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


          {/* <div className='side_container right'>abc</div> */}

        </div>
      </div>

    </div>
  );
};

export default App;
