import React from "react";
import { createPortal } from "react-dom";
import { Box, Typography } from "@mui/material";
import logo from "../assets/logo.PNG";

const LoadingOverlay = ({ open, message }) => {
  if (!open) return null;

  return createPortal(
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0, 0, 0, 0.6)", // dark transparent overlay
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        flexDirection: "column",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Orbiting container */}
      <Box
        sx={{
          position: "relative",
          width: 200,
          height: 200,
        }}
      >
        {/* Central Sphere */}
        <Box
          sx={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #A31D1D, #700000)",
            boxShadow: "0 0 40px rgba(163,29,29,0.7), 0 0 80px rgba(163,29,29,0.5)",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "floatSphere 2s ease-in-out infinite alternate",
          }}
        >
          {/* Center Logo */}
          <Box
            component="img"
            src={logo}
            alt="E.A.R.I.S.T Logo"
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              boxShadow: "0 0 20px rgba(163,29,29,0.7)",
              animation: "heartbeat 1.5s ease-in-out infinite",
            }}
          />
        </Box>

        {/* Orbiting small spheres */}
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "rgba(163,29,29,0.8)",
              position: "absolute",
              top: "50%",
              left: "50%",
              transformOrigin: " -60px 0px",
              animation: `orbit${i} ${3 + i}s linear infinite`,
              boxShadow: "0 0 15px rgba(163,29,29,0.5)",
            }}
          />
        ))}
      </Box>

      {/* Loading message */}
      <Typography
        variant="h6"
        sx={{
          mt: 4,
          color: "#FFF8E1", // cream color for contrast
          fontWeight: "bold",
          animation: "pulse 1.5s infinite",
        }}
      >
        {message}
      </Typography>

      {/* Keyframes */}
      <style>
        {`
          @keyframes heartbeat {
            0%,100% { transform: scale(1); }
            25%,75% { transform: scale(1.15); }
            50% { transform: scale(1.05); }
          }

          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }

          @keyframes floatSphere {
            0% { transform: translate(-50%, -50%) translateY(0); }
            50% { transform: translate(-50%, -50%) translateY(-15px); }
            100% { transform: translate(-50%, -50%) translateY(0); }
          }

          @keyframes orbit0 { 0% { transform: rotate(0deg) translateX(80px); } 100% { transform: rotate(360deg) translateX(80px); } }
          @keyframes orbit1 { 0% { transform: rotate(90deg) translateX(80px); } 100% { transform: rotate(450deg) translateX(80px); } }
          @keyframes orbit2 { 0% { transform: rotate(180deg) translateX(80px); } 100% { transform: rotate(540deg) translateX(80px); } }
          @keyframes orbit3 { 0% { transform: rotate(270deg) translateX(80px); } 100% { transform: rotate(630deg) translateX(80px); } }
        `}
      </style>
    </Box>,
    document.body
  );
};

export default LoadingOverlay;
