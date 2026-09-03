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
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-start", // Align to top
        justifyContent: "center",
        paddingTop: "280px", // Space from top
        background: "rgba(255, 255, 255, 0.47)",
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
