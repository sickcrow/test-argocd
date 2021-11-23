import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";

import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

//serviceWorker.unregister();
