import React from "react";
import {
  CircleLoader,
  ClipLoader,
  RotateLoader,
  RingLoader,
  SyncLoader,
  BeatLoader,
  GridLoader,
  PacmanLoader,
  PropagateLoader,
  SquareLoader,
  FadeLoader,
  MoonLoader,
} from "react-spinners";
import ColorHelper from "../../util/color";

function Loading(props) {
  const colorHelper = new ColorHelper();

  if (!props.is_loading) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.58)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999999,
        cursor: "wait",
        pointerEvents: "all",
      }}
    >
      <MoonLoader color={colorHelper.mainGreen()} loading={true} size={80} />
    </div>
  );
}

export default Loading;
