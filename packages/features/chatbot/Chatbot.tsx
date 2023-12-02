import React, { useState } from "react";

const FloatingIcon = () => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const toggleWindow = () => {
    setIsWindowOpen(!isWindowOpen);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        cursor: "pointer",
        zIndex: 1000,
      }}
      onClick={toggleWindow}>
      <div
        style={{
          backgroundColor: isWindowOpen ? "#ff6347" : "#007bff",
          color: "#fff",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          transition: "background-color 0.3s ease",
        }}>
        &#x263C;
      </div>
      {isWindowOpen && (
        <div
          style={{
            position: "absolute",
            height: "200px",
            width: "300px",
            bottom: "60px",
            right: "0",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            display: "block",
          }}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter text..."
            style={{ marginBottom: "10px", padding: "5px" }}
          />
          <button onClick={handleConfirmClick}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default FloatingIcon;
