import React, { useEffect, useState } from "react";
import { WebMapServiceImageryProvider, ImageryLayer, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faTimes } from "@fortawesome/free-solid-svg-icons";
import "../styles/layerMap.css";
import { toast } from "react-toastify";

const LayerMap = ({ viewerRef }) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [layer, setLayer] = useState(null);

  const [tempValue, setTempValue] = useState("");

  const wmsUrl = "http://localhost:8080/geoserver/wms";
  useEffect(() => {
    if (viewerRef.current && !viewer) {
      var cesiumViewerr = viewerRef.current;

      // Set the viewer in the state
      setViewer(cesiumViewerr);

      // Create an ImageryProvider using the GeoServer WMS URL
      const imageryProvider = new WebMapServiceImageryProvider({
        url: wmsUrl,
        layers: "Tur-Map:Tur_cities",
        parameters: {
          transparent: true,
          format: "image/png",
        },
      });

      // Create an ImageryLayer using the ImageryProvider
      const imageryLayer = new ImageryLayer(imageryProvider);

      // Add the ImageryLayer to the Viewer's imageryLayers collection
      cesiumViewerr.imageryLayers.add(imageryLayer);
      setLayer(imageryLayer);
    }
    // Clean up resources when the component is unmounted
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, [viewerRef.current, viewer]);

  useEffect(() => {
    // Update the visibility of the imagery layer when the state changes
    if (layer) {
      layer.show = isMapVisible;
    }
  }, [isMapVisible, layer]);

  const ChangeLayerFunction = () => {
    // Remove the existing layer
    viewer.imageryLayers.remove(layer);

    // Create a new ImageryProvider using the updated GeoServer WMS URL
    const newImageryProvider = new WebMapServiceImageryProvider({
      url: wmsUrl,
      layers: tempValue,
      parameters: {
        transparent: true,
        format: "image/png",
      },
    });

    // Create a new ImageryLayer using the new ImageryProvider
    const newImageryLayer = new ImageryLayer(newImageryProvider);

    // Add the new ImageryLayer to the Viewer's imageryLayers collection
    viewer.imageryLayers.add(newImageryLayer);

    // Set the new layer in the state
    setLayer(newImageryLayer);

    setTempValue("");
    toast.success("Layer Changed Successfully");
  };

  const [layerMenu, setLayerMenu] = useState(false);

  return (
    <div className="LayerMap">
      <div>
        <button
          onClick={() => {
            setLayerMenu((prev) => !prev);
          }}
        >
          {layerMenu ? (
            <FontAwesomeIcon
              icon={faTimes}
              style={{
                fontSize: "24px", // Adjust the size as needed
              }}
            />
          ) : (
            <>
              <FontAwesomeIcon icon={faLayerGroup} size="2x" />
              Layer
            </>
          )}
        </button>
      </div>
      {layerMenu && (
        <div className="LayerMenu">
          <div className="LayerVisibility">
            <h1>PRESENTATION APP</h1>
            <h3>Layer visibililty</h3>
            <button
              className={` ${isMapVisible ? "active" : ""}`}
              onClick={() => setIsMapVisible(true)}
            >
              {" "}
              Show Layer
            </button>
            <button
              className={` ${isMapVisible ? "" : "active"}`}
              onClick={() => setIsMapVisible(false)}
            >
              Hide Layer
            </button>
          </div>

          <div className="LayerChange">
            <h3>Layer Change</h3>

            <input
              type="text"
              id="beautifulInput"
              placeholder="Layer Name"
              onChange={(e) => setTempValue(e.target.value)}
              value={tempValue}
              width={"100%"}
              margin={"0px"}
            />
            <button onClick={ChangeLayerFunction}>Change the Layer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerMap;

//////////////////////////////// 1nd try
// import React, { useEffect, useState } from "react";
// import { WebMapServiceImageryProvider, ImageryLayer, Viewer } from "cesium";
// import "cesium/Build/Cesium/Widgets/widgets.css";

// const LayerMap = ({ viewerRef }) => {
//   const [isMapVisible, setIsMapVisible] = useState(false);
//   const [viewer, setViewer] = useState(null);

//   useEffect(() => {
//     // const cesiumContainer = document.getElementById("cesiumContainer");

//     // Create the Cesium Viewer
//     // const cesiumViewer = new Viewer(cesiumContainer);
//     if (viewerRef.current) {
//       var cesiumViewerr = viewerRef.current;

//       // Set the viewer in the state
//       setViewer(cesiumViewerr);

//       // Define the GeoServer WMS URL
//       const wmsUrl = "http://localhost:8080/geoserver/Tur-Map/wms";

//       // Create an ImageryProvider using the GeoServer WMS URL
//       const imageryProvider = new WebMapServiceImageryProvider({
//         url: wmsUrl,
//         layers: "Tur-Map:Tur_cities",
//         parameters: {
//           transparent: true,
//           format: "image/png",
//         },
//       });

//       // Create an ImageryLayer using the ImageryProvider
//       const imageryLayer = new ImageryLayer(imageryProvider);

//       // Add the ImageryLayer to the Viewer's imageryLayers collection
//       cesiumViewerr.imageryLayers.add(imageryLayer);
//     }
//     // Clean up resources when the component is unmounted
//     return () => {
//       if (cesiumViewerr && !cesiumViewerr.isDestroyed()) {
//         cesiumViewerr.destroy();
//       }
//     };
//   }, [viewerRef.current]);

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
//       {/* Cesium Viewer */}
//       <button
//         style={{
//           position: "absolute",
//           top: "10px",
//           right: "200px",
//           zIndex: 1000,
//           backgroundColor: "#808080", // Gray background color
//           color: "#ffffff", // White text color
//           padding: "10px", // Padding around the text
//           border: "none", // Remove button border
//           borderRadius: "5px", // Add border-radius for rounded corners
//           cursor: "pointer", // Show pointer cursor on hover
//         }}
//         onClick={toggleMapVisibility}
//       >
//         {isMapVisible ? "Hide Turkey Map" : "Show Turkey Map"}
//       </button>
//     </div>
//   );
// };

// export default LayerMap;
