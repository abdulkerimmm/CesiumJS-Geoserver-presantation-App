import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";
import "../styles/ExportWorkk.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";

const ExportWork = ({ viewerRef }) => {
  const [exportType, setExportType] = useState("pdf");
  const [jpegQuality, setJpegQuality] = useState(0.8); // Initial quality value
  const [showExport, setShowExport] = useState(false);
  const dropdownRef = useRef(null);

  const handleCaptureScreenshot = () => {
    if (viewerRef.current) {
      const viewer = viewerRef.current;
      viewer.scene.context._gl.preserveDrawingBuffer = true;

      if (
        exportType === "pdf" ||
        exportType === "jpg" ||
        exportType === "png"
      ) {
        html2canvas(viewer.scene.canvas).then((canvas) => {
          const screenshotImage = canvas.toDataURL(
            `image/${exportType.toUpperCase()}`,
            exportType === "jpg" ? jpegQuality : undefined
          );

          if (exportType === "pdf") {
            const pdf = new jsPDF();
            pdf.addImage(screenshotImage, "PNG", 0, 0, 210, 297); // Assuming A4 size
            pdf.save("screenshot.pdf");
          } else if (exportType === "jpg" || exportType === "png") {
            const link = document.createElement("a");
            link.href = screenshotImage;
            link.download = `screenshot.${exportType}`;
            link.click();
          }
        });
      } else if (exportType === "svg") {
        domtoimage.toSvg(viewer.scene.canvas).then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "screenshot.svg";
          link.click();
        });
      } else if (exportType === "other") {
        // Handle other export type
        // Add additional export options here
      }
    }
  };

  const handleExportTypeChange = (event) => {
    setExportType(event.target.value);
  };

  return (
    <>
      <div className="export-container">
        <button onClick={() => setShowExport((prev) => !prev)}>
          <FontAwesomeIcon icon={faFileExport} />
          Export
        </button>
        {showExport && (
          <div className="ben">
            <h1 style={{ fontSize: "20px", borderBottom: "2px solid red  " }}>
              PRESENTATION APP
            </h1>
            <div className="containertwo">
              <h3 style={{ marginBottom: "7px" }}>Export Type</h3>
              <select
                className="export-dropdown"
                ref={dropdownRef}
                onChange={handleExportTypeChange}
              >
                <option value="pdf">PDF</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>

              <div className="jpeg-quality">
                <h3 style={{ marginBottom: "7px" }}> Quality</h3>
                <label>
                  Quality:
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={jpegQuality}
                    onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
                  />
                  {jpegQuality}
                </label>
              </div>

              <button
                className="export-button"
                onClick={handleCaptureScreenshot}
              >
                Export
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ExportWork;

// import React, { useRef, useState } from "react";
// import * as Cesium from "cesium";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import domtoimage from "dom-to-image";

// const ExportWork = ({ viewerRef }) => {
//   const [exportType, setExportType] = useState("pdf");
//   const [jpegQuality, setJpegQuality] = useState(0.8);

//   const handleCaptureScreenshot = () => {
//     if (viewerRef.current) {
//       const viewer = viewerRef.current;

//       // Set preserveDrawingBuffer to true
//       viewer.scene.context._gl.preserveDrawingBuffer = true;

//       // Choose the export method based on the selected option
//       if (exportType === "pdf") {
//         exportAsPdf();
//       } else if (exportType === "png") {
//         exportAsPng();
//       } else if (exportType === "jpeg") {
//         exportAsJpeg();
//       }
//     }
//   };

//   const exportAsPdf = () => {
//     html2canvas(document.getElementById("cesiumContainer")).then((canvas) => {
//       const screenshotImage = canvas.toDataURL("image/png");

//       const pdf = new jsPDF();
//       pdf.addImage(screenshotImage, "PNG", 0, 0, 210, 297); // Assuming A4 size
//       pdf.save("screenshot.pdf");
//     });
//   };

//   const exportAsPng = () => {
//     html2canvas(document.getElementById("cesiumContainer")).then((canvas) => {
//       const screenshotImage = canvas.toDataURL("image/png");
//       const link = document.createElement("a");
//       link.href = screenshotImage;
//       link.download = "screenshot.png";
//       link.click();
//     });
//   };

//   const exportAsJpeg = () => {
//     const node = document.getElementById("cesiumContainer");

//     domtoimage.toJpeg(node, { quality: jpegQuality }).then((dataUrl) => {
//       const link = document.createElement("a");
//       link.href = dataUrl;
//       link.download = "screenshot.jpeg";
//       link.click();
//     });
//   };

//   return (
//     <div>
//       <label>
//         Export Type:
//         <select
//           value={exportType}
//           onChange={(e) => setExportType(e.target.value)}
//         >
//           <option value="pdf">PDF</option>
//           <option value="png">PNG</option>
//           <option value="jpeg">JPEG</option>
//         </select>
//       </label>

//       {exportType === "jpeg" && (
//         <label>
//           JPEG Quality:
//           <input
//             type="range"
//             min="0.1"
//             max="1"
//             step="0.1"
//             value={jpegQuality}
//             onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
//           />
//           {jpegQuality}
//         </label>
//       )}

//       <button onClick={handleCaptureScreenshot}>Export</button>
//     </div>
//   );
// };

// export default ExportWork;

//////this is the one that works
// import React, { useRef, useState } from "react";
// import * as Cesium from "cesium";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import domtoimage from "dom-to-image";

// const ExportWork = ({ viewerRef }) => {
//   const [exportType, setExportType] = useState("pdf");
//   const dropdownRef = useRef(null);

//   const handleCaptureScreenshot = () => {
//     if (viewerRef.current) {
//       const viewer = viewerRef.current;
//       viewer.scene.context._gl.preserveDrawingBuffer = true;

//       if (
//         exportType === "pdf" ||
//         exportType === "jpg" ||
//         exportType === "png"
//       ) {
//         html2canvas(viewer.scene.canvas, {
//           ...(exportType === "jpg" && { quality: 0.8 }), // Set quality to 0.8 for JPEG
//         }).then((canvas) => {
//           const screenshotImage = canvas.toDataURL(
//             `image/${exportType.toUpperCase()}`
//           );

//           if (exportType === "pdf") {
//             const pdf = new jsPDF();
//             pdf.addImage(screenshotImage, "PNG", 0, 0, 210, 297); // Assuming A4 size
//             pdf.save("screenshot.pdf");
//           } else if (exportType === "jpg" || exportType === "png") {
//             const link = document.createElement("a");
//             link.href = screenshotImage;
//             link.download = `screenshot.${exportType}`;
//             link.click();
//           }
//         });
//       } else if (exportType === "svg") {
//         domtoimage.toSvg(viewer.scene.canvas).then((dataUrl) => {
//           const link = document.createElement("a");
//           link.href = dataUrl;
//           link.download = "screenshot.svg";
//           link.click();
//         });
//       } else if (exportType === "other") {
//         // Handle other export type
//         // Add additional export options here
//       }
//     }
//   };

//   const handleExportTypeChange = (event) => {
//     setExportType(event.target.value);
//   };

//   return (
//     <div>
//       <select ref={dropdownRef} onChange={handleExportTypeChange}>
//         <option value="pdf">PDF</option>
//         <option value="jpg">JPG</option>
//         <option value="png">PNG</option>
//         <option value="svg">SVG</option>
//         <option value="other">Other</option>
//         {/* Add more export options as needed */}
//       </select>
//       <button onClick={handleCaptureScreenshot}>Export</button>
//     </div>
//   );
// };

// export default ExportWork;

// import React, { useRef, useState } from "react";
// import * as Cesium from "cesium";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// const ExportWork = ({ viewerRef }) => {
//   const [exportFormat, setExportFormat] = useState("pdf");

//   const handleExportFormatChange = (event) => {
//     setExportFormat(event.target.value);
//   };

//   const handleCaptureScreenshot = () => {
//     if (viewerRef.current) {
//       const viewer = viewerRef.current;

//       // Set preserveDrawingBuffer to true
//       viewer.scene.context._gl.preserveDrawingBuffer = true;

//       html2canvas(viewer.scene.canvas).then((canvas) => {
//         const screenshotImage = canvas.toDataURL(`image/${exportFormat}`);

//         if (exportFormat === "pdf") {
//           const pdf = new jsPDF();
//           pdf.addImage(screenshotImage, "PNG", 0, 0, 210, 297); // Assuming A4 size
//           pdf.save("screenshot.pdf");
//         } else {
//           // For other formats, you can handle the download accordingly
//           const link = document.createElement("a");
//           link.href = screenshotImage;
//           link.download = `screenshot.${exportFormat}`;
//           link.click();
//         }
//       });
//     }
//   };

//   return (
//     <div>
//       {/* Dropdown to select export format */}
//       <select onChange={handleExportFormatChange} value={exportFormat}>
//         <option value="pdf">PDF</option>
//         <option value="jpeg">JPEG</option>
//         {/* Add more export formats as needed */}
//       </select>

//       {/* Button to trigger export */}
//       <button onClick={handleCaptureScreenshot}>Export</button>
//     </div>
//   );
// };

// export default ExportWork;

// import React, { useRef } from "react";
// import * as Cesium from "cesium";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// const ExportWork = ({ viewerRef }) => {
//   // const cesiumContainerRef = useRef(null);

//   const handleCaptureScreenshot = () => {
//     if (viewerRef.current) {
//       const viewer = viewerRef.current;
//       // const cesiumContainer = cesiumContainerRef.current;
//       // Set preserveDrawingBuffer to true
//       viewer.scene.context._gl.preserveDrawingBuffer = true;

//       html2canvas(cesiumContainer).then((canvas) => {
//         const screenshotImage = canvas.toDataURL("image/png");

//         const pdf = new jsPDF();
//         pdf.addImage(screenshotImage, "PNG", 0, 0, 210, 297); // Assuming A4 size
//         pdf.save("screenshot.pdf");
//       });
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleCaptureScreenshot}>Export</button>
//     </div>
//   );
// };

// export default ExportWork;
