import React from "react";
import { CiEdit } from "react-icons/ci";
import { GiSaveArrow } from "react-icons/gi";
import { IoCreateOutline } from "react-icons/io5";
import { CiBoxList } from "react-icons/ci";
export default function Title({ mode, title, icons }) {
  function check() {
    var titles = null;
    var icon = null;
    if (mode == "view") {
      icon = <GiSaveArrow />;
      titles = "ព័ត៌មានដែលបានបញ្ចូល";
    } else if (mode == "edit") {
      titles = "កែប្រែព័ត៌មាន";
      icon = <CiEdit />;
    } else if (mode == "create") {
      titles = "សូមបំពេញព័ត៌មាន";
      icon = <IoCreateOutline />;
    } else if (mode == "list") {
      titles = title == undefined ? "បញ្ជី" : "បញ្ជី : " + title;
      icon = <CiBoxList />;
    } else if (mode == "cusotm" || mode == "custom") {
      titles = title;
      icon = icons;
    }

    return (
      <div>
        <h5 className="battambang-bold">
          {icon} {titles}
        </h5>
        <hr />
      </div>
    );
  }
  return <div>{check()}</div>;
}
