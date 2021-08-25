import React, { useRef, useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import { ReactComponent as FullWidth } from "./assets/images/fullView.svg";
import logo2 from "./assets/images/headerLogo.png";
import logo1 from "./assets/images/logo1.png";
import { ReactComponent as ZoomIn } from "./assets/images/plusCircle.svg";
import { ReactComponent as ZoomOut } from "./assets/images/minusCircle.svg";
import { ReactComponent as Note } from "./assets/images/note.svg";
import { ReactComponent as Pen } from "./assets/images/pen.svg";
import SearchBox from "./components/searchBox/SearchBox";
import "./App.css";

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);
  const pageInput = useRef(null);
  const [displayBookmarks, setDisplayBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [highlighToolSelected, setHighlightToolSelected] = useState(false);
  const [fitWidth, setFitWidth] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(true);

  const [docViewer, setDocViewer] = useState(null);
  const [annotManager, setAnnotManager] = useState(null);
  const [stickyAnnotations, setStickyAnnotations] = useState([]);
  const [annotations, setAnnotations] = useState([]);

  const Annotations = window.Annotations;

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const CoreControls = window.CoreControls;
    const docViewer = new CoreControls.DocumentViewer();

    CoreControls.setWorkerPath("/webviewer");
    CoreControls.enableFullPDF(true);

    docViewer.setScrollViewElement(scrollView.current);
    docViewer.setViewerElement(viewer.current);
    docViewer.setOptions({
      enableAnnotations: true,
      enableLeftPanel: ["bookmarksPanel", "bookmarksPanelButton"],
    });
    docViewer.loadDocument("https://bluemetric.s3.us-west-1.amazonaws.com/duckett.pdf",{
      filename: 'duckett.pdf',
      customHeaders: {
        "Access-Control-Allow-Origin":'*',
        "Access-Control-Allow-Credentials" : true
        // Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'
      },
    });
    // docViewer.loadDocument('/files/duckett.pdf');

    // window.document.addEventListener('wheel', (e)=>alert('worked'));
    window.visualViewport.addEventListener("resize", viewportHandler);
    function viewportHandler(event) {
      // NOTE: This doesn't actually work at time of writing
      console.log('worked')
      event.preventDefault();
    }

    setDocViewer(docViewer);
    pageInput.current.style.width = `${pageInput.current.value.length}ch`;

    const annotManager = docViewer.getAnnotationManager();

    docViewer.on("documentLoaded", async () => {
      setCurrentPage(docViewer.getCurrentPage());
      setTotalPages(docViewer.getPageCount());
      // const am = docViewer.getAnnotationManager();
      // setAnnotManager(am);
      setAnnotManager(annotManager);

      // am.on('annotationsDrawn', (annots) => {
      //   // console.log('annotation drawn');
      //   // console.log(annots);
      //   // console.log("Annotation List : ", am.getAnnotationsList())
      // })
      // am.on('annotationSelected', (annotationList, action) => {
      //   // console.log('annotation Selected');
      //   // console.log(annotationList);
      // })

      docViewer.setToolMode(docViewer.getTool("AnnotationEdit"));

      // CREATING BOOKMARKS LIST
      docViewer
        .getDocument()
        .getBookmarks()
        .then((bookmarks) => {
          setDisplayBookmarks(showBookmarks(bookmarks));
        });

      annotManager.on("annotationChanged", () => {
        setAnnotations(
          annotManager
            .getAnnotationsList()
            .filter(
              (annot) =>
                annot.Listable &&
                !annot.isReply() &&
                !annot.Hidden &&
                !annot.isGrouped() &&
                annot.ToolName !== window.Tools.ToolNames.CROP &&
                annot.ToolName === window.Tools.ToolNames.STICKY
            )
            .map((i) => ({ object: i, isEdit: false }))
        );
      });
    });

    docViewer.on("pageNumberUpdated", (page) => {
      setCurrentPage(page);
    });

    // console.log(window.WebViewer)
  }, []);

  useEffect(() => {
    pageInput.current.style.width = `${pageInput.current.value.length}ch`;
  }, [currentPage]);

  const showBookmarks = (list, level = 0) => {
    const bookmarksFormated = [];
    list.forEach((b, i) => {
      bookmarksFormated.push({
        obj: b,
        name: b.name,
        page: b.Ac,
        level: level,
        end: false,
      });
      if (b.children.length > 0) {
        const subs = showBookmarks(b.children, level + 1);
        subs.forEach((s, n) => {
          bookmarksFormated.push(s);
        });
      } else {
        let last = bookmarksFormated.splice(-1).pop();
        bookmarksFormated.push({ ...last, end: true });
      }
    });
    return bookmarksFormated;
  };

  const handTool = () => {
    docViewer.setToolMode(docViewer.getTool(window.Tools.ToolNames.PAN));
  };

  const zoomOut = () => {
    docViewer.zoomTo(docViewer.getZoom() - 0.25);
  };

  const zoomIn = () => {
    docViewer.zoomTo(docViewer.getZoom() + 0.25);
  };

  const fitMode = () => {
    if (fitWidth) {
      docViewer.setFitMode(docViewer.FitMode.FitPage);
    } else {
      docViewer.setFitMode(docViewer.FitMode.FitWidth);
    }
    setFitWidth(!fitWidth);
  };

  const createHighlight = () => {
    highlighToolSelected
      ? docViewer.setToolMode(
        docViewer.getTool(window.Tools.ToolNames.HIGHLIGHT)
      )
      : docViewer.setToolMode(docViewer.getTool("AnnotationEdit"));
    setHighlightToolSelected(!highlighToolSelected);
  };

  const notesTool = () => {
    docViewer.setToolMode(docViewer.getTool(window.Tools.ToolNames.STICKY));
  };

  const pageNavigaton = (e) => {
    e.preventDefault();
    docViewer.setCurrentPage(currentPage);
  };

  return (
    <div className="pdf">
      <div className="pdf_header_section">
        <Grid container alignItems="center" className="pdf_header_container">
          <Grid item md={3} xs={6} className="left_header">
            <div className="book_info">
              <img className="book_thumbnail" src={logo1} alt="logo1" />
              <div className="book_name">Signaalanalyse</div>
            </div>
          </Grid>
          <Grid item md={6} xs={12} className="operations_header">
            <div id="tools">
              <form
                className="page_operation"
                onSubmit={pageNavigaton}
                onBlur={pageNavigaton}
              >
                <span>Page: </span>
                <input
                  className="current_page_input"
                  ref={pageInput}
                  value={currentPage}
                  onChange={(e) => {
                    setCurrentPage(e.target.value);
                  }}
                  onBlur={pageNavigaton}
                />{" "}
                / <span style={{ color: "#606165" }}>{totalPages}</span>
              </form>
              <div className="zoom_buttons">
                <button onClick={zoomIn}>
                  <ZoomIn />
                </button>
                <button onClick={zoomOut}>
                  <ZoomOut />
                </button>
                {/* <button onClick={handTool}>
                  <ZoomOut />
                </button> */}
              </div>
              <button onClick={fitMode}>
                <FullWidth />
              </button>
            </div>
          </Grid>
          <Grid item md={3} xs={6} className="right_header">
            <div>
              <img className="pdf_logo" src={logo2} alt="logo1" />
            </div>
          </Grid>
        </Grid>
      </div>
      <div className="pdf_body">
        <div className="pdf_side_container pdf_left">
          <SearchBox
            Annotations={Annotations}
            annotManager={annotManager}
            docViewer={docViewer}
            searchTermRef={searchTerm}
            searchContainerRef={searchContainerRef}
            updatePage={() => setCurrentPage(docViewer.getCurrentPage())}
          />
          <div className="bookmarks_container">
            <div className="main_bookmarks_container">
              <div
                className="bookmarks_heading"
                onClick={() => setIsContentOpen(!isContentOpen)}
              >
                Contents{" "}
                <ArrowDropUpIcon
                  className={`carrot_icon ${!isContentOpen && "close"}`}
                />{" "}
              </div>
              {isContentOpen && (
                <>
                  {displayBookmarks.map((marks) => {
                    if (marks.end) {
                      return (
                        <li
                          onClick={() => {
                            docViewer.displayBookmark(marks.obj);
                          }}
                          className="subItem"
                          style={{ marginLeft: `calc(24px * ${marks.level})` }}
                        >
                          {marks.name}
                        </li>
                      );
                    } else {
                      return (
                        <div
                          onClick={() => {
                            docViewer.displayBookmark(marks.obj);
                          }}
                          className="bookmarks_subheading"
                          style={{ marginLeft: `calc(24px * ${marks.level})` }}
                        >
                          {marks.name}
                        </div>
                      );
                    }
                  })}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="pdf_main" ref={scrollView}>
          <div id="viewer" ref={viewer}></div>
        </div>
        <div className="pdf_side_container pdf_right">
          {/* <Grid container spacing={1} className="bottom_margin">
            <Grid item md={6} sm={12} xs={12}>
              <button className="operation_btn" onClick={createHighlight}>
                <Pen
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    paddingRight: "0.625rem",
                  }}
                />
                Highlight text
              </button>
            </Grid>
            <Grid item md={6} sm={12} xs={12}>
              <button className="operation_btn" onClick={notesTool}>
                <Note
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    paddingRight: "0.625rem",
                  }}
                />
                Add note
              </button>
            </Grid>
          </Grid> */}
          <div className='pdf_btn_container'>
            <button className='pdf_btn' onClick={createHighlight} style={{marginRight:'0.625rem'}}>
                <Pen
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    paddingRight: "0.625rem",
                  }}
                />
                Highlight text
            </button>
            <button className='pdf_btn' onClick={notesTool}>
                <Note
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    paddingRight: "0.625rem",
                  }}
                />
                Add note
            </button>
          </div>
          <div className="bookmarks_container">
            <div className="main_bookmarks_container">
              <div
                className="bookmarks_heading"
                onClick={() => setIsContentOpen(!isContentOpen)}
              >
                Notes{" "}
                <ArrowDropUpIcon
                  className={`carrot_icon ${!isContentOpen && "close"}`}
                />{" "}
              </div>
              <div id="notes-panel">
                {annotations.map((annot, idx) => {
                  console.log(annot);
                  const { Subject, DateModified, ZB } = annot.object;
                  return (
                    <div key={`annotation_${idx}`} className="note">
                      <p>{`Note: ${idx + 1} - Page: ${ZB}`}</p>
                      <p>{DateModified.toString()}</p>
                      {annot.isEdit && (
                        <input
                          type="text"
                          value={Subject}
                          onChange={(e) => { }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
