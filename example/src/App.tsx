import React from "react";
import { VectorFeatureMap } from "../../src/index";

const App = () => {
  return (
    <div>
      <h1>PRP Maps</h1>
      <VectorFeatureMap style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default App;
