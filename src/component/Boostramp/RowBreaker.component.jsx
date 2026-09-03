import React from "react";

function RowBreaker(p) {
  function check() {
    if (p && p.break) {
      const list = [];
      for (let i = 0; i < p.break; i++) {
        list.push(<div key={i} className="col-md-12 mt-3"></div>);
      }
      return list;
    }

    // Default: if p is falsy OR p.break is falsy
    return <div className="col-md-12 mt-3"></div>;
  }
  return (
    <div hidden={p.isShow == undefined? false : !p.isShow} className="row">
      {check()}
    </div>
  );
}

export default RowBreaker;
