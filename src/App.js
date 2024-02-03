import React, { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import LayerMap from "./components/LayerMap";
import CesiumModels from "./components/CesiumModels";
import ExportWork from "./components/ExportWork";
import DrawingTool from "./components/DrawingTool";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) {
      viewerRef.current = new Cesium.Viewer("cesiumContainer", {
        infoBox: false,
        selectionIndicator: false,
        shadows: true,
        shouldAnimate: true,
        contextOptions: {
          webgl: {
            preserveDrawingBuffer: true, // captrue screenshot gpl
          },
        },
      });

      // viewerRef.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      //   Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      // );
    }
  }, []);

  return (
    <div>
      <div id="cesiumContainer" style={{ height: "100vh" }}></div>
      <ToastContainer />
      <DrawingTool viewerRef={viewerRef} />
      <LayerMap viewerRef={viewerRef} />
      <ExportWork viewerRef={viewerRef} />
      <CesiumModels viewerRef={viewerRef} />
    </div>
  );
}

export default App;

///////////////////////////////////////////////////////////////////////////////////////////// step 3
// import React, { useEffect, useState } from "react";
// import { WebMapServiceImageryProvider, ImageryLayer, Viewer } from "cesium";
// import "cesium/Build/Cesium/Widgets/widgets.css";

// function App() {
//   const [isMapVisible, setIsMapVisible] = useState(true);
//   const [viewer, setViewer] = useState(null);

//   useEffect(() => {
//     const cesiumContainer = document.getElementById("cesiumContainer");

//     // Create the Cesium Viewer
//     const cesiumViewer = new Viewer(cesiumContainer);

//     // Set the viewer in the state
//     setViewer(cesiumViewer);

//     // Define the GeoServer WMS URL
//     const wmsUrl = "http://localhost:8080/geoserver/Tur-Map/wms";

//     // Create an ImageryProvider using the GeoServer WMS URL
//     const imageryProvider = new WebMapServiceImageryProvider({
//       url: wmsUrl,
//       layers: "Tur-Map:Tur_cities",
//       parameters: {
//         transparent: true,
//         format: "image/png",
//       },
//     });

//     // Create an ImageryLayer using the ImageryProvider
//     const imageryLayer = new ImageryLayer(imageryProvider);

//     // Add the ImageryLayer to the Viewer's imageryLayers collection
//     cesiumViewer.imageryLayers.add(imageryLayer);

//     // Clean up resources when the component is unmounted
//     return () => {
//       if (cesiumViewer && !cesiumViewer.isDestroyed()) {
//         cesiumViewer.destroy();
//       }
//     };
//   }, []);

//   const toggleMapVisibility = () => {
//     setIsMapVisible(!isMapVisible);
//   };

//   useEffect(() => {
//     // Update the visibility of the imagery layer when the state changes
//     if (viewer) {
//       viewer.imageryLayers.get(1).show = isMapVisible;
//     }
//   }, [isMapVisible, viewer]);

//   return (
//     <div>
//       <div
//         id="cesiumContainer"
//         style={{ height: "100vh", position: "relative" }}
//       >
//         {/* Cesium Viewer */}
//         <button
//           style={{
//             position: "absolute",
//             top: "10px",
//             right: "200px",
//             zIndex: 1000,
//             backgroundColor: "#808080", // Gray background color
//             color: "#ffffff", // White text color
//             padding: "10px", // Padding around the text
//             border: "none", // Remove button border
//             borderRadius: "5px", // Add border-radius for rounded corners
//             cursor: "pointer", // Show pointer cursor on hover
//           }}
//           onClick={toggleMapVisibility}
//         >
//           {isMapVisible ? "Hide Turkey Map" : "Show Turkey Map"}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;

////////////////////////////////////////////////////////////////////////////////////////////// step 2
// import React, { useEffect } from "react";
// import { Viewer, WebMapServiceImageryProvider, ImageryLayer } from "cesium";
// import "cesium/Build/Cesium/Widgets/widgets.css";

// function App() {
//   useEffect(() => {
//     // Create the Cesium Viewer
//     const viewer = new Viewer("cesiumContainer");

//     // Define the GeoServer WMS URL
//     const wmsUrl = "http://localhost:8080/geoserver/Tur-Map/wms";

//     // Create an ImageryProvider using the GeoServer WMS URL
//     const imageryProvider = new WebMapServiceImageryProvider({
//       url: wmsUrl,
//       layers: "Tur-Map:Tur_cities", // Specify the name of your WMS layer
//       parameters: {
//         transparent: true,
//         format: "image/png",
//       },
//     });

//     // Create an ImageryLayer using the ImageryProvider
//     const imageryLayer = new ImageryLayer(imageryProvider);

//     // Add the ImageryLayer to the Viewer's imageryLayers collection
//     viewer.imageryLayers.add(imageryLayer);
//   }, []);

//   return <div id="cesiumContainer" style={{ height: "100vh" }}></div>;
// }

// export default App;

////////////////////////////////////////////////////////////////////////////////////////////// step 1
// import React from "react";
// import "./App.css";
// import { Viewer } from "cesium";
// import "cesium/Build/Cesium/Widgets/widgets.css";
// import { useEffect } from "react";
// import ExportWork from './ExportWork';
// function App() {
//   useEffect(() => {
//     const viewer = new Viewer("cesiumContainer");
//   }, []);
//   return <div id="cesiumContainer"></div>;
// }

// export default App;
