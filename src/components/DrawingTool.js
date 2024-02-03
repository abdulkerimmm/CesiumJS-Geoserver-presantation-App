import React, { useEffect, useState } from "react";

import { SketchPicker } from "react-color";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/draw.css";

import {
  faTrash,
  faCircle,
  faDrawPolygon,
  faMinus,
  faObjectGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  faBars,
  faTimes,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";

const DrawingTool = ({ viewerRef }) => {
  const [drawingMode, setDrawingMode] = useState("line");
  const [color, setColor] = useState("WHITE");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    if (viewerRef.current) {
      var cesiumViewer = viewerRef.current;

      let activeShapePoints = [];
      let activeShape;
      let floatingPoint;

      const createPoint = (worldPosition) => {
        const point = cesiumViewer.entities.add({
          position: worldPosition,
          point: {
            color: Cesium.Color.fromCssColorString(color).withAlpha(0.7),
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        });
        return point;
      };

      const drawShape = (positionData) => {
        let shape;
        const material = new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(color).withAlpha(0.7)
        );

        switch (drawingMode) {
          case "line":
            shape = cesiumViewer.entities.add({
              polyline: {
                positions: positionData,
                clampToGround: true,
                width: 3,
                material,
              },
            });
            break;
          case "polygon":
            shape = cesiumViewer.entities.add({
              polygon: {
                hierarchy: positionData,
                material,
              },
            });
            break;
          case "point":
            if (positionData.length > 0) {
              shape = createPoint(positionData[positionData.length - 1]);
            }
            break;
          case "rectangle":
            if (positionData.length === 2) {
              const [startPosition, endPosition] = positionData;
              const startCartographic =
                Cesium.Cartographic.fromCartesian(startPosition);
              const endCartographic =
                Cesium.Cartographic.fromCartesian(endPosition);

              const west = Math.min(
                startCartographic.longitude,
                endCartographic.longitude
              );
              const east = Math.max(
                startCartographic.longitude,
                endCartographic.longitude
              );
              const south = Math.min(
                startCartographic.latitude,
                endCartographic.latitude
              );
              const north = Math.max(
                startCartographic.latitude,
                endCartographic.latitude
              );

              shape = cesiumViewer.entities.add({
                rectangle: {
                  coordinates: Cesium.Rectangle.fromRadians(
                    west,
                    south,
                    east,
                    north
                  ),
                  material,
                },
              });
            }
            break;
          case "circle":
            if (positionData.length === 2) {
              const [center, pointOnCircle] = positionData;
              const radius = Cesium.Cartesian3.distance(center, pointOnCircle);
              shape = cesiumViewer.entities.add({
                position: center,
                ellipse: {
                  semiMinorAxis: radius,
                  semiMajorAxis: radius,
                  material,
                },
              });
            }
            break;
          case "ellipse":
            if (positionData.length === 2) {
              const [center, pointOnEllipse] = positionData;
              const semiMinorAxis =
                Cesium.Cartesian3.distance(center, pointOnEllipse) * 0.5;
              const semiMajorAxis = semiMinorAxis * 2;

              shape = cesiumViewer.entities.add({
                position: center,
                ellipse: {
                  semiMinorAxis,
                  semiMajorAxis,
                  material,
                },
              });
            }
            break;
          // Add more drawing modes as needed
          default:
            break;
        }

        return shape;
      };

      const terminateShape = () => {
        activeShapePoints.pop();
        drawShape(activeShapePoints);
        cesiumViewer.entities.remove(floatingPoint);
        cesiumViewer.entities.remove(activeShape);
        floatingPoint = undefined;
        activeShape = undefined;
        activeShapePoints = [];
      };

      if (cesiumViewer) {
        var handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);
      }

      handler.setInputAction((event) => {
        const ray = cesiumViewer.camera.getPickRay(event.position);
        const earthPosition = cesiumViewer.scene.globe.pick(
          ray,
          cesiumViewer.scene
        );

        if (Cesium.defined(earthPosition)) {
          if (activeShapePoints.length === 0) {
            floatingPoint = createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            const dynamicPositions = new Cesium.CallbackProperty(() => {
              if (drawingMode === "polygon") {
                return new Cesium.PolygonHierarchy(activeShapePoints);
              }
              return activeShapePoints;
            }, false);
            activeShape = drawShape(dynamicPositions);
          }
          activeShapePoints.push(earthPosition);
          createPoint(earthPosition);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((event) => {
        if (Cesium.defined(floatingPoint)) {
          const ray = cesiumViewer.camera.getPickRay(event.endPosition);
          const newPosition = cesiumViewer.scene.globe.pick(
            ray,
            cesiumViewer.scene
          );
          if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(() => {
        terminateShape();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    return () => {
      if (cesiumViewer && !cesiumViewer.isDestroyed()) {
        handler.destroy();
        // Do not destroy the viewer when the component is unmounted
      }
    };
  }, [drawingMode, color, isMenuOpen]);

  // Handle hover events
  const handleButtonHover = (buttonName) => {
    setHoveredButton(buttonName);
  };

  // Handle unhover events
  const handleButtonUnhover = () => {
    setHoveredButton(null);
  };

  const handleDeleteDrawing = () => {
    if (viewerRef.current) {
      viewerRef.current.entities.removeAll();
    }
  };

  const handleToggleDrawingMode = (mode) => {
    setDrawingMode(mode);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <div>
      <button className="button-container" onClick={toggleMenu}>
        {isMenuOpen ? (
          <>
            <FontAwesomeIcon
              icon={faTimes}
              style={{
                fontSize: "24px", // Adjust the size as needed
                color: "black", // Adjust the color as needed
              }}
            />
          </>
        ) : (
          <>
            <FontAwesomeIcon
              icon={faBars}
              style={{
                fontSize: "24px", // Adjust the size as needed
                color: "black", // Adjust the color as needed
                marginRight: "5px",
              }}
            />
            <FontAwesomeIcon
              icon={faPencilAlt}
              style={{ color: "black", fontSize: "24px" }}
            />{" "}
            draw
          </>
        )}
      </button>

      {isMenuOpen && (
        <div className="menu-container">
          <h1 className="menu-header">PRESENTATION APP</h1>
          <div className="drawing-modes">
            <h3 className="drawing-modes-heade">Drawing Modes</h3>
            <div className="drawing-modes-layout">
              <button
                className="drawing-mode-button"
                style={{
                  backgroundColor: drawingMode === "line" ? "lightblue" : "",
                }}
                onClick={() => handleToggleDrawingMode("line")}
                onMouseEnter={() => handleButtonHover("line")}
                onMouseLeave={handleButtonUnhover}
              >
                <FontAwesomeIcon
                  icon={faMinus}
                  style={{
                    fontSize: "25px",
                    color:
                      hoveredButton === "line"
                        ? "darkred" // Hovered and selected
                        : "black", // Selected but not hovered
                  }}
                />
              </button>
              <button
                className="drawing-mode-button"
                style={{
                  backgroundColor: drawingMode === "point" ? "lightblue" : "",
                }}
                onClick={() => handleToggleDrawingMode("point")}
                onMouseEnter={() => handleButtonHover("point")}
                onMouseLeave={handleButtonUnhover}
              >
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{
                    fontSize: "5px",
                    color:
                      hoveredButton === "point"
                        ? "darkred" // Hovered and selected
                        : "black", // Selected but not hovered
                  }}
                />
              </button>
              <button
                className="drawing-mode-button"
                style={{
                  backgroundColor: drawingMode === "polygon" ? "lightblue" : "",
                }}
                onClick={() => handleToggleDrawingMode("polygon")}
                onMouseEnter={() => handleButtonHover("polygon")}
                onMouseLeave={handleButtonUnhover}
              >
                <FontAwesomeIcon
                  icon={faDrawPolygon}
                  style={{
                    fontSize: "25px",
                    color:
                      hoveredButton === "polygon"
                        ? "darkred" // Hovered and selected
                        : "black", // Selected but not hovered
                  }}
                />
              </button>

              <button
                className="drawing-mode-button"
                style={{
                  backgroundColor:
                    drawingMode === "rectangle" ? "lightblue" : "",
                }}
                onClick={() => handleToggleDrawingMode("rectangle")}
                onMouseEnter={() => handleButtonHover("rectangle")}
                onMouseLeave={handleButtonUnhover}
              >
                <FontAwesomeIcon
                  icon={faObjectGroup}
                  style={{
                    fontSize: "25px",
                    color:
                      hoveredButton === "rectangle"
                        ? "darkred" // Hovered and selected
                        : "black", // Selected but not hovered
                  }}
                />
              </button>

              <button
                className="drawing-mode-button"
                style={{
                  backgroundColor: drawingMode === "circle" ? "lightblue" : "",
                }}
                onClick={() => handleToggleDrawingMode("circle")}
                onMouseEnter={() => handleButtonHover("circle")}
                onMouseLeave={handleButtonUnhover}
              >
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{
                    fontSize: "25px",
                    color:
                      hoveredButton === "circle"
                        ? "darkred" // Hovered and selected
                        : "black", // Selected but not hovered
                  }}
                />
              </button>
              <button
                className="drawing-mode-button"
                style={{
                  backgroundColor: drawingMode === "ellipse" ? "lightblue" : "",
                }}
                onClick={() => handleToggleDrawingMode("ellipse")}
                onMouseEnter={() => handleButtonHover("ellipse")}
                onMouseLeave={handleButtonUnhover}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  style={{
                    width: "34px", // Adjust the size
                    height: "25px", // Adjust the height to create an ellipse-like shape
                    fill:
                      hoveredButton === "ellipse"
                        ? "darkred" // Hovered and selected
                        : "black", // Selected but not hovered
                  }}
                >
                  <path d="M 12 4 a 8 4 0 0 1 0 16 a 8 4 0 0 1 0 -16" />
                </svg>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ marginBottom: "2px" }}>Color</h3>

            <div className="color-section">
              <div className="selected-color-label">Selected Color:</div>
              <div
                className="selected-color"
                style={{
                  backgroundColor: color,
                }}
              ></div>
            </div>

            <div>
              <SketchPicker color={color} onChange={handleColorChange} />
            </div>
          </div>
          <div>
            <h3>Other Actions</h3>
            <button
              onClick={handleDeleteDrawing}
              onMouseEnter={() => handleButtonHover("delete")}
              onMouseLeave={handleButtonUnhover}
              className="delete-button"
              style={{
                color: hoveredButton === "delete" ? "darkred" : "red",
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingTool;

/////// i will look later uncomplete code
// import React, { useEffect, useState, useRef } from "react";
// import * as Cesium from "cesium";
// import { SketchPicker } from "react-color";
// // Add these imports to your existing imports
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import {
//   faTrash,
//   faSquare,
//   faCircle,
//   faDrawPolygon,
//   faDotCircle,
//   faEllipsisH,
//   faMinus,
//   faObjectGroup,
//   faEllipseH,
// } from "@fortawesome/free-solid-svg-icons";
// import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
// import { WebMapServiceImageryProvider, ImageryLayer, Viewer } from "cesium";

// const DrawingTool = () => {
//   const viewerRef = useRef(null);
//   const [drawingMode, setDrawingMode] = useState("line");
//   const [color, setColor] = useState("WHITE");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [hoveredButton, setHoveredButton] = useState(null);

//   useEffect(() => {
//     if (!viewerRef.current) {
//       viewerRef.current = new Cesium.Viewer("cesiumContainer", {
//         shouldAnimate: true,
//       });

//       viewerRef.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//         Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//       );
//     }
//     // const cesiumContainer = document.getElementById("cesiumContainer");

//     // Create the Cesium Viewer
//     const cesiumViewer = viewerRef.current;

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
//     let activeShapePoints = [];
//     let activeShape;
//     let floatingPoint;

//     const createPoint = (worldPosition) => {
//       const point = cesiumViewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.fromCssColorString(color).withAlpha(0.7),
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       const material = new Cesium.ColorMaterialProperty(
//         Cesium.Color.fromCssColorString(color).withAlpha(0.7)
//       );

//       switch (drawingMode) {
//         case "line":
//           shape = cesiumViewer.entities.add({
//             polyline: {
//               positions: positionData,
//               clampToGround: true,
//               width: 3,
//               material,
//             },
//           });
//           break;
//         case "polygon":
//           shape = cesiumViewer.entities.add({
//             polygon: {
//               hierarchy: positionData,
//               material,
//             },
//           });
//           break;
//         case "point":
//           if (positionData.length > 0) {
//             shape = createPoint(positionData[positionData.length - 1]);
//           }
//           break;
//         case "rectangle":
//           if (positionData.length === 2) {
//             const [startPosition, endPosition] = positionData;
//             const startCartographic =
//               Cesium.Cartographic.fromCartesian(startPosition);
//             const endCartographic =
//               Cesium.Cartographic.fromCartesian(endPosition);

//             const west = Math.min(
//               startCartographic.longitude,
//               endCartographic.longitude
//             );
//             const east = Math.max(
//               startCartographic.longitude,
//               endCartographic.longitude
//             );
//             const south = Math.min(
//               startCartographic.latitude,
//               endCartographic.latitude
//             );
//             const north = Math.max(
//               startCartographic.latitude,
//               endCartographic.latitude
//             );

//             shape = cesiumViewer.entities.add({
//               rectangle: {
//                 coordinates: Cesium.Rectangle.fromRadians(
//                   west,
//                   south,
//                   east,
//                   north
//                 ),
//                 material,
//               },
//             });
//           }
//           break;
//         case "circle":
//           if (positionData.length === 2) {
//             const [center, pointOnCircle] = positionData;
//             const radius = Cesium.Cartesian3.distance(center, pointOnCircle);
//             shape = cesiumViewer.entities.add({
//               position: center,
//               ellipse: {
//                 semiMinorAxis: radius,
//                 semiMajorAxis: radius,
//                 material,
//               },
//             });
//           }
//           break;
//         case "ellipse":
//           if (positionData.length === 2) {
//             const [center, pointOnEllipse] = positionData;
//             const semiMinorAxis =
//               Cesium.Cartesian3.distance(center, pointOnEllipse) * 0.5;
//             const semiMajorAxis = semiMinorAxis * 2;

//             shape = cesiumViewer.entities.add({
//               position: center,
//               ellipse: {
//                 semiMinorAxis,
//                 semiMajorAxis,
//                 material,
//               },
//             });
//           }
//           break;
//         // Add more drawing modes as needed
//         default:
//           break;
//       }

//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePoints.pop();
//       drawShape(activeShapePoints);
//       cesiumViewer.entities.remove(floatingPoint);
//       cesiumViewer.entities.remove(activeShape);
//       floatingPoint = undefined;
//       activeShape = undefined;
//       activeShapePoints = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = cesiumViewer.camera.getPickRay(event.position);
//       const earthPosition = cesiumViewer.scene.globe.pick(
//         ray,
//         cesiumViewer.scene
//       );

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePoints.length === 0) {
//           floatingPoint = createPoint(earthPosition);
//           activeShapePoints.push(earthPosition);
//           const dynamicPositions = new Cesium.CallbackProperty(() => {
//             if (drawingMode === "polygon") {
//               return new Cesium.PolygonHierarchy(activeShapePoints);
//             }
//             return activeShapePoints;
//           }, false);
//           activeShape = drawShape(dynamicPositions);
//         }
//         activeShapePoints.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPoint)) {
//         const ray = cesiumViewer.camera.getPickRay(event.endPosition);
//         const newPosition = cesiumViewer.scene.globe.pick(
//           ray,
//           cesiumViewer.scene
//         );
//         if (Cesium.defined(newPosition)) {
//           floatingPoint.position.setValue(newPosition);
//           activeShapePoints.pop();
//           activeShapePoints.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       if (cesiumViewer && !cesiumViewer.isDestroyed()) {
//         cesiumViewer.destroy();
//       }
//       handler.destroy();
//       // Do not destroy the viewer when the component is unmounted
//     };
//   }, [drawingMode, color]);

//   // Handle hover events
//   const handleButtonHover = (buttonName) => {
//     setHoveredButton(buttonName);
//   };

//   // Handle unhover events
//   const handleButtonUnhover = () => {
//     setHoveredButton(null);
//   };

//   const handleDeleteDrawing = () => {
//     if (viewerRef.current) {
//       viewerRef.current.entities.removeAll();
//     }
//   };

//   const handleToggleDrawingMode = (mode) => {
//     setDrawingMode(mode);
//   };

//   const handleColorChange = (newColor) => {
//     setColor(newColor.hex);
//   };

//   const toggleMenu = () => {
//     setIsMenuOpen((prevIsOpen) => !prevIsOpen);
//   };

//   return (
//     <div>
//       <button
//         style={{
//           position: "fixed",
//           color: "#A9A9A9",
//           top: "10px",
//           left: "10px",
//           zIndex: 1000,
//         }}
//         onClick={toggleMenu}
//       >
//         {isMenuOpen ? (
//           <FontAwesomeIcon
//             icon={faTimes}
//             style={{
//               fontSize: "24px", // Adjust the size as needed
//               color: "black", // Adjust the color as needed // or use "#A9A9A9" consistently
//             }}
//           />
//         ) : (
//           <FontAwesomeIcon
//             icon={faBars}
//             style={{
//               fontSize: "24px", // Adjust the size as needed
//               color: "black", // Adjust the color as needed
//             }}
//           />
//         )}
//       </button>

//       {isMenuOpen && (
//         <div
//           style={{
//             position: "fixed",
//             top: "40px",
//             left: "10px",
//             zIndex: 1000,
//             background: "#A9A9A9",
//             border: "1px solid #ccc",
//             padding: "10px",
//             borderRadius: "5px",
//             boxShadow: "0 0 10px #ccc",
//           }}
//         >
//           <h1 style={{ fontSize: "20px", borderBottom: "2px solid red  " }}>
//             PRESENTATION APP
//           </h1>
//           <div style={{ marginBottom: "10px" }}>
//             <h3 style={{ marginBottom: "7px" }}>Drawing Modes</h3>
//             <div
//               style={{
//                 display: "flex",
//                 flexWrap: "wrap",
//                 justifyContent: "center",
//                 display: "grid",
//                 gridTemplateColumns: "repeat(2, 1fr)",
//                 gridGap: "10px",
//               }}
//             >
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "line" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("line")}
//                 onMouseEnter={() => handleButtonHover("line")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faMinus}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "line"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "point" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("point")}
//                 onMouseEnter={() => handleButtonHover("point")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faCircle}
//                   style={{
//                     fontSize: "5px",
//                     color:
//                       hoveredButton === "point"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "polygon" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("polygon")}
//                 onMouseEnter={() => handleButtonHover("polygon")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faDrawPolygon}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "polygon"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>

//               <button
//                 style={{
//                   backgroundColor:
//                     drawingMode === "rectangle" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("rectangle")}
//                 onMouseEnter={() => handleButtonHover("rectangle")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faObjectGroup}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "rectangle"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>

//               <button
//                 style={{
//                   backgroundColor: drawingMode === "circle" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("circle")}
//                 onMouseEnter={() => handleButtonHover("circle")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faCircle}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "circle"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "ellipse" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("ellipse")}
//                 onMouseEnter={() => handleButtonHover("ellipse")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   style={{
//                     width: "34px", // Adjust the size
//                     height: "25px", // Adjust the height to create an ellipse-like shape
//                     fill:
//                       hoveredButton === "ellipse"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 >
//                   <path d="M 12 4 a 8 4 0 0 1 0 16 a 8 4 0 0 1 0 -16" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           <div style={{ marginBottom: "10px" }}>
//             <h3 style={{ marginBottom: "2px" }}>Color</h3>

//             <div
//               style={{
//                 marginBottom: "10px",
//                 display: "flex",
//                 flexDirection: "row",
//               }}
//             >
//               <div style={{ marginRight: "5px" }}>Selected Color:</div>
//               <div
//                 style={{
//                   backgroundColor: color,
//                   width: "20px",
//                   height: "20px",
//                   display: "inline-block",
//                 }}
//               ></div>
//             </div>

//             <div>
//               <SketchPicker color={color} onChange={handleColorChange} />
//             </div>
//           </div>
//           <div>
//             <h3>Other Actions</h3>
//             <button
//               onClick={handleDeleteDrawing}
//               onMouseEnter={() => handleButtonHover("delete")}
//               onMouseLeave={handleButtonUnhover}
//               style={{
//                 fontSize: "24px",
//                 color: hoveredButton === "delete" ? "darkred" : "red",
//                 background: "none",
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               <FontAwesomeIcon icon={faTrash} />
//             </button>
//           </div>
//         </div>
//       )}

//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//     </div>
//   );
// };

// export default DrawingTool;

/////// don't touch this one
// import React, { useEffect, useState, useRef } from "react";
// import * as Cesium from "cesium";
// import { SketchPicker } from "react-color";
// // Add these imports to your existing imports
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import {
//   faTrash,
//   faSquare,
//   faCircle,
//   faDrawPolygon,
//   faDotCircle,
//   faEllipsisH,
//   faMinus,
//   faObjectGroup,
//   faEllipseH,
// } from "@fortawesome/free-solid-svg-icons";
// import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

// const DrawingTool = () => {
//   const viewerRef = useRef(null);
//   const [drawingMode, setDrawingMode] = useState("line");
//   const [color, setColor] = useState("WHITE");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [hoveredButton, setHoveredButton] = useState(null);

//   useEffect(() => {
//     if (!viewerRef.current) {
//       viewerRef.current = new Cesium.Viewer("cesiumContainer", {
//         shouldAnimate: true,
//       });

//       viewerRef.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//         Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//       );
//     }

//     const cesiumViewer = viewerRef.current;

//     let activeShapePoints = [];
//     let activeShape;
//     let floatingPoint;

//     const createPoint = (worldPosition) => {
//       const point = cesiumViewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.fromCssColorString(color).withAlpha(0.7),
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       const material = new Cesium.ColorMaterialProperty(
//         Cesium.Color.fromCssColorString(color).withAlpha(0.7)
//       );

//       switch (drawingMode) {
//         case "line":
//           shape = cesiumViewer.entities.add({
//             polyline: {
//               positions: positionData,
//               clampToGround: true,
//               width: 3,
//               material,
//             },
//           });
//           break;
//         case "polygon":
//           shape = cesiumViewer.entities.add({
//             polygon: {
//               hierarchy: positionData,
//               material,
//             },
//           });
//           break;
//         case "point":
//           if (positionData.length > 0) {
//             shape = createPoint(positionData[positionData.length - 1]);
//           }
//           break;
//         case "rectangle":
//           if (positionData.length === 2) {
//             const [startPosition, endPosition] = positionData;
//             const startCartographic =
//               Cesium.Cartographic.fromCartesian(startPosition);
//             const endCartographic =
//               Cesium.Cartographic.fromCartesian(endPosition);

//             const west = Math.min(
//               startCartographic.longitude,
//               endCartographic.longitude
//             );
//             const east = Math.max(
//               startCartographic.longitude,
//               endCartographic.longitude
//             );
//             const south = Math.min(
//               startCartographic.latitude,
//               endCartographic.latitude
//             );
//             const north = Math.max(
//               startCartographic.latitude,
//               endCartographic.latitude
//             );

//             shape = cesiumViewer.entities.add({
//               rectangle: {
//                 coordinates: Cesium.Rectangle.fromRadians(
//                   west,
//                   south,
//                   east,
//                   north
//                 ),
//                 material,
//               },
//             });
//           }
//           break;
//         case "circle":
//           if (positionData.length === 2) {
//             const [center, pointOnCircle] = positionData;
//             const radius = Cesium.Cartesian3.distance(center, pointOnCircle);
//             shape = cesiumViewer.entities.add({
//               position: center,
//               ellipse: {
//                 semiMinorAxis: radius,
//                 semiMajorAxis: radius,
//                 material,
//               },
//             });
//           }
//           break;
//         case "ellipse":
//           if (positionData.length === 2) {
//             const [center, pointOnEllipse] = positionData;
//             const semiMinorAxis =
//               Cesium.Cartesian3.distance(center, pointOnEllipse) * 0.5;
//             const semiMajorAxis = semiMinorAxis * 2;

//             shape = cesiumViewer.entities.add({
//               position: center,
//               ellipse: {
//                 semiMinorAxis,
//                 semiMajorAxis,
//                 material,
//               },
//             });
//           }
//           break;
//         // Add more drawing modes as needed
//         default:
//           break;
//       }

//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePoints.pop();
//       drawShape(activeShapePoints);
//       cesiumViewer.entities.remove(floatingPoint);
//       cesiumViewer.entities.remove(activeShape);
//       floatingPoint = undefined;
//       activeShape = undefined;
//       activeShapePoints = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = cesiumViewer.camera.getPickRay(event.position);
//       const earthPosition = cesiumViewer.scene.globe.pick(
//         ray,
//         cesiumViewer.scene
//       );

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePoints.length === 0) {
//           floatingPoint = createPoint(earthPosition);
//           activeShapePoints.push(earthPosition);
//           const dynamicPositions = new Cesium.CallbackProperty(() => {
//             if (drawingMode === "polygon") {
//               return new Cesium.PolygonHierarchy(activeShapePoints);
//             }
//             return activeShapePoints;
//           }, false);
//           activeShape = drawShape(dynamicPositions);
//         }
//         activeShapePoints.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPoint)) {
//         const ray = cesiumViewer.camera.getPickRay(event.endPosition);
//         const newPosition = cesiumViewer.scene.globe.pick(
//           ray,
//           cesiumViewer.scene
//         );
//         if (Cesium.defined(newPosition)) {
//           floatingPoint.position.setValue(newPosition);
//           activeShapePoints.pop();
//           activeShapePoints.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       handler.destroy();
//       // Do not destroy the viewer when the component is unmounted
//     };
//   }, [drawingMode, color]);

//   // Handle hover events
//   const handleButtonHover = (buttonName) => {
//     setHoveredButton(buttonName);
//   };

//   // Handle unhover events
//   const handleButtonUnhover = () => {
//     setHoveredButton(null);
//   };

//   const handleDeleteDrawing = () => {
//     if (viewerRef.current) {
//       viewerRef.current.entities.removeAll();
//     }
//   };

//   const handleToggleDrawingMode = (mode) => {
//     setDrawingMode(mode);
//   };

//   const handleColorChange = (newColor) => {
//     setColor(newColor.hex);
//   };

//   const toggleMenu = () => {
//     setIsMenuOpen((prevIsOpen) => !prevIsOpen);
//   };

//   return (
//     <div>
//       <button
//         style={{
//           position: "fixed",
//           color: "#A9A9A9",
//           top: "10px",
//           left: "10px",
//           zIndex: 1000,
//         }}
//         onClick={toggleMenu}
//       >
//         {isMenuOpen ? (
//           <FontAwesomeIcon
//             icon={faTimes}
//             style={{
//               fontSize: "24px", // Adjust the size as needed
//               color: "black", // Adjust the color as needed
//             }}
//           />
//         ) : (
//           <FontAwesomeIcon
//             icon={faBars}
//             style={{
//               fontSize: "24px", // Adjust the size as needed
//               color: "black", // Adjust the color as needed
//             }}
//           />
//         )}
//       </button>

//       {isMenuOpen && (
//         <div
//           style={{
//             position: "fixed",
//             top: "40px",
//             left: "10px",
//             zIndex: 1000,
//             background: "#A9A9A9",
//             border: "1px solid #ccc",
//             padding: "10px",
//             borderRadius: "5px",
//             boxShadow: "0 0 10px #ccc",
//           }}
//         >
//           <h1 style={{ fontSize: "20px", borderBottom: "2px solid red  " }}>
//             PRESENTATION APP
//           </h1>
//           <div style={{ marginBottom: "10px" }}>
//             <h3 style={{ marginBottom: "7px" }}>Drawing Modes</h3>
//             <div
//               style={{
//                 display: "flex",
//                 flexWrap: "wrap",
//                 justifyContent: "center",
//                 display: "grid",
//                 gridTemplateColumns: "repeat(2, 1fr)",
//                 gridGap: "10px",
//               }}
//             >
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "line" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("line")}
//                 onMouseEnter={() => handleButtonHover("line")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faMinus}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "line"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "point" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("point")}
//                 onMouseEnter={() => handleButtonHover("point")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faCircle}
//                   style={{
//                     fontSize: "5px",
//                     color:
//                       hoveredButton === "point"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "polygon" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("polygon")}
//                 onMouseEnter={() => handleButtonHover("polygon")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faDrawPolygon}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "polygon"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>

//               <button
//                 style={{
//                   backgroundColor:
//                     drawingMode === "rectangle" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("rectangle")}
//                 onMouseEnter={() => handleButtonHover("rectangle")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faObjectGroup}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "rectangle"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>

//               <button
//                 style={{
//                   backgroundColor: drawingMode === "circle" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("circle")}
//                 onMouseEnter={() => handleButtonHover("circle")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <FontAwesomeIcon
//                   icon={faCircle}
//                   style={{
//                     fontSize: "25px",
//                     color:
//                       hoveredButton === "circle"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 />
//               </button>
//               <button
//                 style={{
//                   backgroundColor: drawingMode === "ellipse" ? "lightblue" : "",
//                   border: "solid 2px black transparent",
//                   cursor: "pointer",
//                   marginRight: "10px", // Adjust as needed
//                   padding: "2px", // Adjust as needed
//                 }}
//                 onClick={() => handleToggleDrawingMode("ellipse")}
//                 onMouseEnter={() => handleButtonHover("ellipse")}
//                 onMouseLeave={handleButtonUnhover}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   style={{
//                     width: "34px", // Adjust the size
//                     height: "25px", // Adjust the height to create an ellipse-like shape
//                     fill:
//                       hoveredButton === "ellipse"
//                         ? "darkred" // Hovered and selected
//                         : "black", // Selected but not hovered
//                   }}
//                 >
//                   <path d="M 12 4 a 8 4 0 0 1 0 16 a 8 4 0 0 1 0 -16" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           <div style={{ marginBottom: "10px" }}>
//             <h3 style={{ marginBottom: "2px" }}>Color</h3>

//             <div
//               style={{
//                 marginBottom: "10px",
//                 display: "flex",
//                 flexDirection: "row",
//               }}
//             >
//               <div style={{ marginRight: "5px" }}>Selected Color:</div>
//               <div
//                 style={{
//                   backgroundColor: color,
//                   width: "20px",
//                   height: "20px",
//                   display: "inline-block",
//                 }}
//               ></div>
//             </div>

//             <div>
//               <SketchPicker color={color} onChange={handleColorChange} />
//             </div>
//           </div>
//           <div>
//             <h3>Other Actions</h3>
//             <button
//               onClick={handleDeleteDrawing}
//               onMouseEnter={() => handleButtonHover("delete")}
//               onMouseLeave={handleButtonUnhover}
//               style={{
//                 fontSize: "24px",
//                 color: hoveredButton === "delete" ? "darkred" : "red",
//                 background: "none",
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               <FontAwesomeIcon icon={faTrash} />
//             </button>
//           </div>
//         </div>
//       )}

//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//     </div>
//   );
// };

// export default DrawingTool;

////////////////////////////// this is the best one one sure  so far
// import React, { useEffect, useState, useRef } from "react";
// import * as Cesium from "cesium";
// import { SketchPicker } from "react-color";

// const DrawingTool = () => {
//   const viewerRef = useRef(null);
//   const [drawingMode, setDrawingMode] = useState("line");
//   const [color, setColor] = useState("WHITE");
//   const [showColorPicker, setShowColorPicker] = useState(false);

//   useEffect(() => {
//     if (!viewerRef.current) {
//       viewerRef.current = new Cesium.Viewer("cesiumContainer", {
//         shouldAnimate: true,
//       });

//       viewerRef.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//         Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//       );
//     }

//     const cesiumViewer = viewerRef.current;

//     let activeShapePoints = [];
//     let activeShape;
//     let floatingPoint;

//     const createPoint = (worldPosition) => {
//       const point = cesiumViewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.fromCssColorString(color).withAlpha(0.7),
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       const material = new Cesium.ColorMaterialProperty(
//         Cesium.Color.fromCssColorString(color).withAlpha(0.7)
//       );

//       switch (drawingMode) {
//         case "line":
//           shape = cesiumViewer.entities.add({
//             polyline: {
//               positions: positionData,
//               clampToGround: true,
//               width: 3,
//               material,
//             },
//           });
//           break;
//         case "polygon":
//           shape = cesiumViewer.entities.add({
//             polygon: {
//               hierarchy: positionData,
//               material,
//             },
//           });
//           break;
//         case "point":
//           if (positionData.length > 0) {
//             shape = createPoint(positionData[positionData.length - 1]);
//           }
//           break;
//         case "rectangle":
//           if (positionData.length === 2) {
//             const [startPosition, endPosition] = positionData;
//             const startCartographic =
//               Cesium.Cartographic.fromCartesian(startPosition);
//             const endCartographic =
//               Cesium.Cartographic.fromCartesian(endPosition);

//             const west = Math.min(
//               startCartographic.longitude,
//               endCartographic.longitude
//             );
//             const east = Math.max(
//               startCartographic.longitude,
//               endCartographic.longitude
//             );
//             const south = Math.min(
//               startCartographic.latitude,
//               endCartographic.latitude
//             );
//             const north = Math.max(
//               startCartographic.latitude,
//               endCartographic.latitude
//             );

//             shape = cesiumViewer.entities.add({
//               rectangle: {
//                 coordinates: Cesium.Rectangle.fromRadians(
//                   west,
//                   south,
//                   east,
//                   north
//                 ),
//                 material,
//               },
//             });
//           }
//           break;
//         case "circle":
//           if (positionData.length === 2) {
//             const [center, pointOnCircle] = positionData;
//             const radius = Cesium.Cartesian3.distance(center, pointOnCircle);
//             shape = cesiumViewer.entities.add({
//               position: center,
//               ellipse: {
//                 semiMinorAxis: radius,
//                 semiMajorAxis: radius,
//                 material,
//               },
//             });
//           }
//           break;
//         case "ellipse":
//           if (positionData.length === 2) {
//             const [center, pointOnEllipse] = positionData;
//             const semiMinorAxis =
//               Cesium.Cartesian3.distance(center, pointOnEllipse) * 0.5;
//             const semiMajorAxis = semiMinorAxis * 2;

//             shape = cesiumViewer.entities.add({
//               position: center,
//               ellipse: {
//                 semiMinorAxis,
//                 semiMajorAxis,
//                 material,
//               },
//             });
//           }
//           break;
//         // Add more drawing modes as needed
//         default:
//           break;
//       }

//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePoints.pop();
//       drawShape(activeShapePoints);
//       cesiumViewer.entities.remove(floatingPoint);
//       cesiumViewer.entities.remove(activeShape);
//       floatingPoint = undefined;
//       activeShape = undefined;
//       activeShapePoints = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = cesiumViewer.camera.getPickRay(event.position);
//       const earthPosition = cesiumViewer.scene.globe.pick(
//         ray,
//         cesiumViewer.scene
//       );

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePoints.length === 0) {
//           floatingPoint = createPoint(earthPosition);
//           activeShapePoints.push(earthPosition);
//           const dynamicPositions = new Cesium.CallbackProperty(() => {
//             if (drawingMode === "polygon") {
//               return new Cesium.PolygonHierarchy(activeShapePoints);
//             }
//             return activeShapePoints;
//           }, false);
//           activeShape = drawShape(dynamicPositions);
//         }
//         activeShapePoints.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPoint)) {
//         const ray = cesiumViewer.camera.getPickRay(event.endPosition);
//         const newPosition = cesiumViewer.scene.globe.pick(
//           ray,
//           cesiumViewer.scene
//         );
//         if (Cesium.defined(newPosition)) {
//           floatingPoint.position.setValue(newPosition);
//           activeShapePoints.pop();
//           activeShapePoints.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       handler.destroy();
//       // Do not destroy the viewer when the component is unmounted
//     };
//   }, [drawingMode, color]);

//   const handleDeleteDrawing = () => {
//     if (viewerRef.current) {
//       viewerRef.current.entities.removeAll();
//     }
//   };

//   const handleToggleDrawingMode = () => {
//     setDrawingMode((prevMode) => {
//       switch (prevMode) {
//         case "line":
//           return "polygon";
//         case "polygon":
//           return "point";
//         case "point":
//           return "rectangle";
//         case "rectangle":
//           return "circle";
//         case "circle":
//           return "ellipse";
//         case "ellipse":
//           return "line";
//         // Add more cases for additional drawing modes
//         default:
//           return "line";
//       }
//     });
//   };
//   const handleColorChange = (newColor) => {
//     setColor(newColor.hex);
//   };
//   const handleColorPickerToggle = () => {
//     setShowColorPicker((prev) => !prev);
//   };
//   return (
//     <div>
//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//       <button onClick={handleDeleteDrawing}>Delete Drawing</button>
//       <button onClick={handleToggleDrawingMode}>
//         Toggle Drawing Mode ({drawingMode})
//       </button>
//       <button onClick={handleColorPickerToggle}>Toggle Color Picker</button>
//       {showColorPicker && (
//         <div>
//           <SketchPicker color={color} onChange={handleColorChange} />
//         </div>
//       )}
//       <label>
//         Selected Color:{" "}
//         <div
//           style={{
//             backgroundColor: color,
//             width: "20px",
//             height: "20px",
//             display: "inline-block",
//           }}
//         ></div>
//       </label>
//     </div>
//   );
// };

// export default DrawingTool;

//////////////////////////// this is the best one so far
// import React, { useEffect, useState, useRef } from "react";
// import * as Cesium from "cesium";

// const DrawingTool = () => {
//   const viewerRef = useRef(null);
//   const [drawingMode, setDrawingMode] = useState("line");

//   useEffect(() => {
//     if (!viewerRef.current) {
//       viewerRef.current = new Cesium.Viewer("cesiumContainer", {
//         shouldAnimate: true,
//       });

//       viewerRef.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//         Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//       );
//     }

//     const cesiumViewer = viewerRef.current;

//     let activeShapePoints = [];
//     let activeShape;
//     let floatingPoint;

//     const createPoint = (worldPosition) => {
//       const point = cesiumViewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.WHITE,
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       if (drawingMode === "line") {
//         shape = cesiumViewer.entities.add({
//           polyline: {
//             positions: positionData,
//             clampToGround: true,
//             width: 3,
//           },
//         });
//       } else if (drawingMode === "polygon") {
//         shape = cesiumViewer.entities.add({
//           polygon: {
//             hierarchy: positionData,
//             material: new Cesium.ColorMaterialProperty(
//               Cesium.Color.WHITE.withAlpha(0.7)
//             ),
//           },
//         });
//       }
//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePoints.pop();
//       drawShape(activeShapePoints);
//       cesiumViewer.entities.remove(floatingPoint);
//       cesiumViewer.entities.remove(activeShape);
//       floatingPoint = undefined;
//       activeShape = undefined;
//       activeShapePoints = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = cesiumViewer.camera.getPickRay(event.position);
//       const earthPosition = cesiumViewer.scene.globe.pick(
//         ray,
//         cesiumViewer.scene
//       );

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePoints.length === 0) {
//           floatingPoint = createPoint(earthPosition);
//           activeShapePoints.push(earthPosition);
//           const dynamicPositions = new Cesium.CallbackProperty(() => {
//             if (drawingMode === "polygon") {
//               return new Cesium.PolygonHierarchy(activeShapePoints);
//             }
//             return activeShapePoints;
//           }, false);
//           activeShape = drawShape(dynamicPositions);
//         }
//         activeShapePoints.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPoint)) {
//         const ray = cesiumViewer.camera.getPickRay(event.endPosition);
//         const newPosition = cesiumViewer.scene.globe.pick(
//           ray,
//           cesiumViewer.scene
//         );
//         if (Cesium.defined(newPosition)) {
//           floatingPoint.position.setValue(newPosition);
//           activeShapePoints.pop();
//           activeShapePoints.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       handler.destroy();
//       // Do not destroy the viewer when the component is unmounted
//     };
//   }, [drawingMode]);

//   const handleDeleteDrawing = () => {
//     if (viewerRef.current) {
//       viewerRef.current.entities.removeAll();
//     }
//   };

//   const handleToggleDrawingMode = () => {
//     setDrawingMode((prevMode) => (prevMode === "line" ? "polygon" : "line"));
//   };

//   return (
//     <div>
//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//       <button onClick={handleDeleteDrawing}>Delete Drawing</button>
//       <button onClick={handleToggleDrawingMode}>
//         Toggle Drawing Mode ({drawingMode})
//       </button>
//     </div>
//   );
// };

// export default DrawingTool;

////////////////////////////////
// import React, { useEffect, useRef } from "react";
// import * as Cesium from "cesium";

// const DrawingTool = () => {
//   const viewerRef = useRef(null);
//   const drawingModeRef = useRef("line");
//   const activeShapePointsRef = useRef([]);
//   const floatingPointRef = useRef(null);
//   const activeShapeRef = useRef(null);

//   useEffect(() => {
//     const viewer = new Cesium.Viewer("cesiumContainer", {
//       selectionIndicator: false,
//       infoBox: false,
//       terrain: Cesium.Terrain.fromWorldTerrain(),
//     });

//     viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//       Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//     );

//     viewerRef.current = viewer;

//     const createPoint = (worldPosition) => {
//       const point = viewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.WHITE,
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       if (drawingModeRef.current === "line") {
//         shape = viewer.entities.add({
//           polyline: {
//             positions: positionData,
//             clampToGround: true,
//             width: 3,
//           },
//         });
//       } else if (drawingModeRef.current === "polygon") {
//         shape = viewer.entities.add({
//           polygon: {
//             hierarchy: positionData,
//             material: new Cesium.ColorMaterialProperty(
//               Cesium.Color.WHITE.withAlpha(0.7)
//             ),
//           },
//         });
//       }
//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePointsRef.current.pop();
//       if (drawingModeRef.current === "line") {
//         drawShape(activeShapePointsRef.current);
//       } else if (drawingModeRef.current === "polygon") {
//         const dynamicPositions = new Cesium.CallbackProperty(() => {
//           return new Cesium.PolygonHierarchy(activeShapePointsRef.current);
//         }, false);
//         activeShapeRef.current = drawShape(dynamicPositions);
//       }
//       viewer.entities.remove(floatingPointRef.current);
//       floatingPointRef.current = undefined;
//       activeShapePointsRef.current = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = viewer.camera.getPickRay(event.position);
//       const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePointsRef.current.length === 0) {
//           floatingPointRef.current = createPoint(earthPosition);
//           activeShapePointsRef.current.push(earthPosition);
//         }
//         activeShapePointsRef.current.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPointRef.current)) {
//         const ray = viewer.camera.getPickRay(event.endPosition);
//         const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
//         if (Cesium.defined(newPosition)) {
//           floatingPointRef.current.position.setValue(newPosition);
//           activeShapePointsRef.current.pop();
//           activeShapePointsRef.current.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       handler.destroy();
//       if (viewer) {
//         viewer.destroy();
//       }
//     };
//   }, []);

//   const handleDeleteDrawing = () => {
//     if (viewerRef.current) {
//       viewerRef.current.entities.removeAll();
//     }
//   };

//   const handleToggleDrawingMode = () => {
//     drawingModeRef.current =
//       drawingModeRef.current === "line" ? "polygon" : "line";
//     if (activeShapeRef.current) {
//       activeShapeRef.current.show = false;
//     }
//   };

//   return (
//     <div>
//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//       <button onClick={handleDeleteDrawing}>Delete Drawing</button>
//       <button onClick={handleToggleDrawingMode}>
//         Toggle Drawing Mode ({drawingModeRef.current})
//       </button>
//     </div>
//   );
// };

// export default DrawingTool;

////////////////////////////////////////////////////////////////////////////////////////////// step 3
// import React, { useEffect, useState } from "react";
// import * as Cesium from "cesium";

// const DrawingTool = () => {
//   const [viewer, setViewer] = useState(null);
//   const [drawingMode, setDrawingMode] = useState("line");

//   useEffect(() => {
//     const viewer = new Cesium.Viewer("cesiumContainer", {
//       shouldAnimate: true,
//     });

//     viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//       Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//     );

//     setViewer(viewer);

//     let activeShapePoints = [];
//     let activeShape;
//     let floatingPoint;

//     const createPoint = (worldPosition) => {
//       const point = viewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.WHITE,
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       if (drawingMode === "line") {
//         shape = viewer.entities.add({
//           polyline: {
//             positions: positionData,
//             clampToGround: true,
//             width: 3,
//           },
//         });
//       } else if (drawingMode === "polygon") {
//         shape = viewer.entities.add({
//           polygon: {
//             hierarchy: positionData,
//             material: new Cesium.ColorMaterialProperty(
//               Cesium.Color.WHITE.withAlpha(0.7)
//             ),
//           },
//         });
//       }
//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePoints.pop();
//       drawShape(activeShapePoints);
//       viewer.entities.remove(floatingPoint);
//       viewer.entities.remove(activeShape);
//       floatingPoint = undefined;
//       activeShape = undefined;
//       activeShapePoints = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = viewer.camera.getPickRay(event.position);
//       const earthPosition = viewer.scene.globe.pick(
//         ray,
//         viewer.scene
//       );

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePoints.length === 0) {
//           floatingPoint = createPoint(earthPosition);
//           activeShapePoints.push(earthPosition);
//           const dynamicPositions = new Cesium.CallbackProperty(() => {
//             if (drawingMode === "polygon") {
//               return new Cesium.PolygonHierarchy(activeShapePoints);
//             }
//             return activeShapePoints;
//           }, false);
//           activeShape = drawShape(dynamicPositions);
//         }
//         activeShapePoints.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPoint)) {
//         const ray = viewer.camera.getPickRay(event.endPosition);
//         const newPosition = viewer.scene.globe.pick(
//           ray,
//           viewer.scene
//         );
//         if (Cesium.defined(newPosition)) {
//           floatingPoint.position.setValue(newPosition);
//           activeShapePoints.pop();
//           activeShapePoints.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       handler.destroy();
//       if (viewer) {
//         viewer.destroy();
//       }
//     };
//   }, [drawingMode]);

//   const handleDeleteDrawing = () => {
//     if (viewer) {
//       viewer.entities.removeAll();
//     }
//   };

//   const handleToggleDrawingMode = () => {
//     setDrawingMode((prevMode) => (prevMode === "line" ? "polygon" : "line"));
//   };

//   return (
//     <div>
//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//       <button onClick={handleDeleteDrawing}>Delete Drawing</button>
//       <button onClick={handleToggleDrawingMode}>
//         Toggle Drawing Mode ({drawingMode})
//       </button>
//     </div>
//   );
// };

// export default DrawingTool;

////////////////////////////////////////////////////////////////////////////////////////////// step 2
// import React, { useEffect, useState } from "react";
// import * as Cesium from "cesium";

// const DrawingTool = () => {
//   const [viewer, setViewer] = useState(null);

//   useEffect(() => {
//     const viewer = new Cesium.Viewer("cesiumContainer", {
//       shouldAnimate: true,
//     });

//     viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//       Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//     );

//     setViewer(viewer);

//     let drawingMode = "line";
//     let activeShapePoints = [];
//     let activeShape;
//     let floatingPoint;

//     const createPoint = (worldPosition) => {
//       const point = viewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.WHITE,
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       if (drawingMode === "line") {
//         shape = viewer.entities.add({
//           polyline: {
//             positions: positionData,
//             clampToGround: true,
//             width: 3,
//           },
//         });
//       } else if (drawingMode === "polygon") {
//         shape = viewer.entities.add({
//           polygon: {
//             hierarchy: positionData,
//             material: new Cesium.ColorMaterialProperty(
//               Cesium.Color.WHITE.withAlpha(0.7)
//             ),
//           },
//         });
//       }
//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePoints.pop();
//       drawShape(activeShapePoints);
//       viewer.entities.remove(floatingPoint);
//       viewer.entities.remove(activeShape);
//       floatingPoint = undefined;
//       activeShape = undefined;
//       activeShapePoints = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = viewer.camera.getPickRay(event.position);
//       const earthPosition = viewer.scene.globe.pick(
//         ray,
//         viewer.scene
//       );

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePoints.length === 0) {
//           floatingPoint = createPoint(earthPosition);
//           activeShapePoints.push(earthPosition);
//           const dynamicPositions = new Cesium.CallbackProperty(() => {
//             if (drawingMode === "polygon") {
//               return new Cesium.PolygonHierarchy(activeShapePoints);
//             }
//             return activeShapePoints;
//           }, false);
//           activeShape = drawShape(dynamicPositions);
//         }
//         activeShapePoints.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPoint)) {
//         const ray = viewer.camera.getPickRay(event.endPosition);
//         const newPosition = viewer.scene.globe.pick(
//           ray,
//           viewer.scene
//         );
//         if (Cesium.defined(newPosition)) {
//           floatingPoint.position.setValue(newPosition);
//           activeShapePoints.pop();
//           activeShapePoints.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       handler.destroy();
//       if (viewer) {
//         viewer.destroy();
//       }
//     };
//   }, []);

//   const handleDeleteDrawing = () => {
//     if (viewer) {
//       viewer.entities.removeAll();
//     }
//   };

//   return (
//     <div>
//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//       <button onClick={handleDeleteDrawing}>Delete Drawing</button>
//     </div>
//   );
// };

// export default DrawingTool;

////////////////////////////////////////////////////////////////////////////////////////////// step 1
// import React, { useEffect } from "react";
// import * as Cesium from "cesium";

// const DrawingTool = () => {
//   useEffect(() => {
//     const viewer = new Cesium.Viewer("cesiumContainer", {
//       shouldAnimate: true,
//     });

//     viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//       Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//     );

//     let drawingMode = "line";
//     let activeShapePoints = [];
//     let activeShape;
//     let floatingPoint;

//     const createPoint = (worldPosition) => {
//       const point = viewer.entities.add({
//         position: worldPosition,
//         point: {
//           color: Cesium.Color.WHITE,
//           pixelSize: 5,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       return point;
//     };

//     const drawShape = (positionData) => {
//       let shape;
//       if (drawingMode === "line") {
//         shape = viewer.entities.add({
//           polyline: {
//             positions: positionData,
//             clampToGround: true,
//             width: 3,
//           },
//         });
//       } else if (drawingMode === "polygon") {
//         shape = viewer.entities.add({
//           polygon: {
//             hierarchy: positionData,
//             material: new Cesium.ColorMaterialProperty(
//               Cesium.Color.WHITE.withAlpha(0.7)
//             ),
//           },
//         });
//       }
//       return shape;
//     };

//     const terminateShape = () => {
//       activeShapePoints.pop();
//       drawShape(activeShapePoints);
//       viewer.entities.remove(floatingPoint);
//       viewer.entities.remove(activeShape);
//       floatingPoint = undefined;
//       activeShape = undefined;
//       activeShapePoints = [];
//     };

//     const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

//     handler.setInputAction((event) => {
//       const ray = viewer.camera.getPickRay(event.position);
//       const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);

//       if (Cesium.defined(earthPosition)) {
//         if (activeShapePoints.length === 0) {
//           floatingPoint = createPoint(earthPosition);
//           activeShapePoints.push(earthPosition);
//           const dynamicPositions = new Cesium.CallbackProperty(() => {
//             if (drawingMode === "polygon") {
//               return new Cesium.PolygonHierarchy(activeShapePoints);
//             }
//             return activeShapePoints;
//           }, false);
//           activeShape = drawShape(dynamicPositions);
//         }
//         activeShapePoints.push(earthPosition);
//         createPoint(earthPosition);
//       }
//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     handler.setInputAction((event) => {
//       if (Cesium.defined(floatingPoint)) {
//         const ray = viewer.camera.getPickRay(event.endPosition);
//         const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
//         if (Cesium.defined(newPosition)) {
//           floatingPoint.position.setValue(newPosition);
//           activeShapePoints.pop();
//           activeShapePoints.push(newPosition);
//         }
//       }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//     handler.setInputAction(() => {
//       terminateShape();
//     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//     return () => {
//       handler.destroy();
//       if (viewer) {
//         viewer.destroy();
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <div id="cesiumContainer" style={{ height: "100vh" }}></div>
//     </div>
//   );
// };

// export default DrawingTool;
