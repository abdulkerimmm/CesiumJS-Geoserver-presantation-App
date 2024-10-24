import React, { useEffect, useState } from "react";
import * as Cesium from "cesium";
import "../styles/cesiumModel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
const CesiumModels = ({ viewerRef }) => {
  const [showw, setShoww] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [textValue, setTextValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTheModel, setShowTheModel] = useState(true);

  const [models, setModels] = useState([
    {
      id: 2415711,
      name: "Cesium_Air",
    },
    {
      id: 2415931,
      name: "CesiumDrone",
    },
    {
      id: 2416324,
      name: "PointCloudWave",
    },
    {
      id: 2415940,
      name: "Wood_Tower",
    },
    {
      id: 2415942,
      name: "Shadow_Tester",
    },
  ]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        Cesium.Ion.defaultAccessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMzNjMDExYS02NDRiLTQwNDgtYTBjYS00ODg5MzBkZGQ0OTUiLCJpZCI6MTg0NTI0LCJpYXQiOjE3Mjk4MDE2MTB9.TkqLK6RKYYt1wV9ojJLAs5XWEogGdcfU87TcB8BET3M";

        const index = models.findIndex(
          (item) => item.id === parseInt(selectedModel)
        );

        const assetId = models[index].id; // Replace with your asset ID
        const modelUrl = await Cesium.IonResource.fromAssetId(assetId);

        const heading = 0;
        const pitch = 0;
        const roll = 0;
        const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

        const position = Cesium.Cartesian3.fromDegrees(
          -123.0744619,
          44.0503706,
          heading
        );
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
          position,
          hpr
        );

        const entity = viewerRef.current.entities.add({
          name: models[index].name,
          position: position,
          orientation: orientation,
          model: {
            uri: modelUrl,
            minimumPixelSize: 128,
            maximumScale: 10000,
          },
          show: showTheModel,
        });
        viewerRef.current.trackedEntity = entity;

        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            -123.0744619,
            44.0503706,
            10000
          ),
        });
      } catch (error) {
        console.error("Error loading 3D model:", error);
      }
    };

    if (!viewerRef.current) {
      console.error("Viewer is not defined.");
      return;
    } else {
      viewerRef.current.entities.removeAll();
      loadModel();
    }
  }, [showw, showTheModel]);

  const modeleSelectHandler = (e) => (event) => {
    setSelectedModel(event.target.value);
  };

  const addModelHandler = (e) => {
    e.preventDefault();

    const tempArray = [...models];
    tempArray.push({
      id: parseInt(numberValue),
      name: textValue,
    });
    setModels(tempArray);
    setTextValue("");
    setNumberValue("");
    toast.success("Model added successfully!");
  };

  const deleteModelHandler = (id) => {
    const tempArray = [...models];
    const index = tempArray.findIndex((item) => item.id === id);
    tempArray.splice(index, 1);
    setModels(tempArray);
  };

  const showTheModelHandler = () => {
    setShoww((prev) => !prev);
    setShowTheModel(true);
  };
  return (
    <div>
      <button
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="menu-toggle-btn"
        style={{ color: "black" }}
      >
        {isMenuOpen ? (
          <FontAwesomeIcon
            icon={faTimes}
            style={{
              fontSize: "24px", // Adjust the size as needed
            }}
          />
        ) : (
          <>
            {" "}
            <FontAwesomeIcon
              icon={faCube}
              size="2x"
              style={{ color: "black" }}
            />{" "}
            Model
          </>
        )}
      </button>
      {isMenuOpen && (
        <div className="menu-container">
          <h1 className="menu-title">PRESENTATION APP</h1>
          <div className="menu-section">
            <h3>Model Selection</h3>

            <select onChange={modeleSelectHandler(this)}>
              <option>select model...</option>
              {models.map((model, index) => (
                <option key={index} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <button onClick={showTheModelHandler}>show the model</button>
            <button onClick={() => setShowTheModel(false)}>
              Hide the model
            </button>
          </div>
          <div className="menu-section">
            <h3>Add Model</h3>
            <form onSubmit={addModelHandler} className="add-model-form">
              <div className="form-row">
                <label>Model name:</label>
                <input
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label>Model id :</label>
                <input
                  type="text"
                  value={numberValue}
                  onChange={(e) => setNumberValue(e.target.value)}
                />
              </div>
              <button type="submit">Add model</button>
            </form>
          </div>
          <div className="menu-section-delete">
            <h3>Delete Model</h3>
            {models.map((model, index) => (
              <div key={index}>
                {model.name}
                <button onClick={() => deleteModelHandler(model.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CesiumModels;

{
  /* <div>
<button
  onClick={() => setIsMenuOpen((prev) => !prev)}
  style={{
    position: "fixed",
    color: "#A9A9A9",
    top: "10px",
    left: "100px",
    zIndex: 1000,
  }}
>
  model
</button>
{isMenuOpen && (
  <div
    style={{
      position: "fixed",
      top: "40px",
      left: "20px",
      zIndex: 1000,
      background: "#A9A9A9",
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      boxShadow: "0 0 10px #ccc",
    }}
  >
    <h1 style={{ fontSize: "20px", borderBottom: "2px solid red  " }}>
      PRESENTATION APP
    </h1>
    <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
      <h3 style={{ marginBottom: "7px" }}>Model Selection</h3>
      <button onClick={() => setShoww((prev) => !prev)}>
        show the model
      </button>
      <select onChange={modeleSelectHandler(this)}>
        <option>select model...</option>
        {models.map((model, index) => (
          <option key={index} value={model.val}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
    <div>
      <h3 style={{ marginBottom: "7px" }}>Add Model</h3>
      <form
        onSubmit={addModelHnadler}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <label>model name:</label>
        <input
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
        />
        <label>model id:</label>
        <input
          type="text"
          value={numberValue}
          onChange={(e) => setNumberValue(e.target.value)}
        />
        <button type="submit">add model</button>
      </form>
    </div>

    <div>
      <h3 style={{ marginBottom: "7px" }}>Delete Model</h3>
      {models.map((model, index) => (
        <div key={index}>
          {model.name}
          <button onClick={() => deleteModelHandler(model.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  </div>
)}
</div> */
}

// // CesiumEntities.js
// import React, { useEffect } from "react";
// import * as Cesium from "cesium";
// import { type } from "./ExportWork";

// const CesiumEntities = ({ viewerRef }) => {
//   useEffect(() => {
//     if (viewerRef.current) {
//       const viewer = viewerRef.current;

//       const shadowMap = viewer.shadowMap;
//       shadowMap.maximumDistance = 10000.0;

//       // Create model function
//       function createModel(url, height) {
//         viewer.entities.removeAll();

//         const position = Cesium.Cartesian3.fromDegrees(
//           -123.0744619,
//           44.0503706,
//           height
//         );
//         const heading = Cesium.Math.toRadians(135);
//         const pitch = 0;
//         const roll = 0;
//         const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
//         const orientation = Cesium.Transforms.headingPitchRollQuaternion(
//           position,
//           hpr
//         );

//         const entity = viewer.entities.add({
//           name: url,
//           position: position,
//           orientation: orientation,
//           model: {
//             uri: url,
//             minimumPixelSize: 128,
//             maximumScale: 20000,
//           },
//         });

//         viewer.trackedEntity = entity;
//       }

//       // Model options
//       const options = [
//         {
//           text: "Aircraft",
//           onselect: function () {
//             createModel("https://assets.cesium.com/34040/bike.glb", 5000.0);
//           },
//         },
//         {
//           text: "Drone",
//           onselect: function () {
//             createModel("https://assets.cesium.com/23931/drone.glb", 150.0);
//           },
//         },
//         // Add more model options as needed
//       ];

//       // Add toolbar menu
//       Sandcastle.addToolbarMenu(options);

//       // Cleanup function
//       return () => {
//         // Optional: Cleanup logic when the component is unmounted
//         // For example, remove entities, reset viewer settings, etc.
//       };
//     }
//   }, [viewerRef]);

//   return <div id="cesiumContainer" style={{ height: "100vh" }}></div>;
// };

// export default CesiumEntities;
