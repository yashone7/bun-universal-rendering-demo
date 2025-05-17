import React, { useState } from "react";

const HomePage = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="page home-page">
      <h1>Welcome to our Isomorphic React App!</h1>
      <p>This page is rendered on both server and client.</p>
      <div>
        <button onClick={() => setCount((prevState) => prevState + 1)}>
          Add
        </button>

        <p>count: {count}</p>

        <button
          disabled={count <= 0}
          onClick={() => setCount((prevState) => prevState - 1)}
        >
          subtract
        </button>
      </div>
    </div>
  );
};

export default HomePage;
