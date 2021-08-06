import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { Document, Page } from 'react-pdf';

const ReactPDF = () => {

  return (
    <div className="App">
      <div id="main-column">
        <div className="center" id="tools">
          <Document
            file="/files/pdftron_about.pdf"
          >
            <Page pageNumber={0} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default ReactPDF;