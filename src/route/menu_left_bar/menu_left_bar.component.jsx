// React
import React, { useState } from "react";

// Script
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import RouteScript from "../../route/route.script";

// Style
import "./menu_left_bar.style.css";

function MenuLeftBar(prop) {
  //====================================================
  // Declaration
  const clickBackgroundActive = "#004a0f"; // Dark green
  const hoverBackground = "#d4edda"; // Light green hover
  const route = prop.prop.route;
  const [menuRouteActive, setRouteActive] = useState(null);
  const routeScript = new RouteScript();
  const rawRoutes = routeScript.route();

  //====================================================
  // Convert List Route
  const convertPermissionsToArray = (raw) => {
    const grouped = {};
    for (const [key, value] of Object.entries(raw)) {
      const match = key.match(/^(.*)_(create|edit|index|delete)$/);
      if (!match) continue;
      const [_, baseKey, action] = match;
      if (!grouped[baseKey]) {
        grouped[baseKey] = {
          url: value.url ?? "",
          status: value.status,
          icon: value.icon,
          document: value.document,
          moduleKey: baseKey,
          title: value.title,
          permissions: {},
        };
      }
      grouped[baseKey].permissions[action] = key;
    }
    return Object.values(grouped);
  };
  const convertPermissionsToArrayParent = (raw) => {
    const grouped = {};
    for (const [key, value] of Object.entries(raw)) {
      const match = key.match(/^(.*)_(parent)$/);
      if (!match) continue;
      const [_, baseKey, action] = match;
      if (!grouped[baseKey]) {
        grouped[baseKey] = {
          status: value.status,
          icon: value.icon,
          document: value.document,
          moduleKey: baseKey,
          title: value.title,
          hidden_menu: value.hidden_menu,
          permissions: {},
        };
      }
      grouped[baseKey].permissions[action] = key;
    }
    var data = Object.values(grouped);

    return data;
  };
  const initialPermissionsArray = convertPermissionsToArray(rawRoutes);
  const initialPermissionsArray_Parent =
    convertPermissionsToArrayParent(rawRoutes);

  //====================================================
  // Sub View
  function menuCustom(route, icon, module) {
    return (
      <MenuItem
        style={{ marginTop: "5px", marginBottom: "5px" }}
        hidden={!module.status}
        onClick={() => {
          setRouteActive(route);
          prop.event(route);
        }}
        active={checkActiveMenu(route)}
        icon={
          prop.prop.isMobile == true
            ? icon
            : prop.prop.menuCollaped == true
              ? null
              : icon
        }
        component={<Link to={route.url} />}
        // style={{ backgroundColor: "#FAFAFA" }}
      >
        <label
          className="title"
          style={{
            paddingLeft: icon == null ? "25px" : "0px",
            cursor: "pointer",
            height: "auto",
            lineHeight: "1.8",
          }}
        >
          {route.title}
        </label>
      </MenuItem>
    );
  }

  function checkActiveSubParent(listRoute) {
    for (let i = 0; i < listRoute.length; i++) {
      const cleanedRouteUrl = cleanUpRouteURL_WindowPath(listRoute[i].url);
      const cleanedWindowPath = cleanUpRouteURL_WindowPath(
        window.location.pathname,
      );

      if (cleanedRouteUrl === cleanedWindowPath) {
        return {
          height: "auto",
          lineHeight: "1.8",
          color: clickBackgroundActive,
          backgroundColor: "white", // Optional background
          "&:hover": {
            color: "#FAFAFA",
          },
        };
      }
    }

    return {
      height: "auto",
      lineHeight: "1.8",
      color: "gray",
    };
  }
  function cleanUpRouteURL_WindowPath(url) {
    const segments = (url ?? "").split("/");

    // Find the index of "view" in segments
    const viewIndex = segments.indexOf("view");
    const editIndex = segments.indexOf("edit");

    if (viewIndex !== -1) {
      // Check if there is a next segment after "view"
      if (segments.length > viewIndex + 1) {
        // Remove the segment after "view"
        segments.splice(viewIndex + 1, 1);
      }
    }

    if (editIndex !== -1) {
      // Check if there is a next segment after "view"
      if (segments.length > editIndex + 1) {
        // Remove the segment after "view"
        segments.splice(editIndex + 1, 1);
      }
    }

    // Join back and make sure it starts with "/"
    const cleanPath = segments.join("/");
    return cleanPath.startsWith("/") ? cleanPath : "/" + cleanPath;
  }

  function checkActiveMenu(route) {
    if (window.location.pathname.startsWith(route.url)) {
      setTimeout(() => {
        setRouteActive(route);
      }, 100);
      return true;
    } else {
      return false;
    }
  }

  //====================================================
  // View
  const lockSubParentShowMenu =
    prop.prop.isMobile == true
      ? "siemreap-regular submenu-locked"
      : prop.prop.menuCollaped
        ? "siemreap-regular"
        : "siemreap-regular submenu-locked";

  function View_SubMenu(row, i) {
    const showIcon = prop.prop.isMobile
      ? null
      : prop.prop.menuCollaped
        ? row.icon
        : null;

    var isHidden = true;
    const obj = row.status ?? {};
    const status = Object.entries(obj).map(([key, value]) => ({
      key,
      value,
    }));
    status.map((rowSt) => {
      if (rowSt.value == true) {
        isHidden = false;
      }
    });

    //
    var listOfActive = [];
    const array = Object.keys(row.status);
    array.map((rowInd) => {
      listOfActive.push(route[rowInd]);
    });

    return (
      <SubMenu
        hidden={isHidden}
        key={i}
        defaultOpen={true}
        className={lockSubParentShowMenu}
        style={checkActiveSubParent(listOfActive)}
        icon={showIcon}
        label={row.title}
      >
        {initialPermissionsArray.map((module, k) => {
          if (module.document === row.document) {
            const routeItem = route[module.permissions.index];
            return (
              <React.Fragment key={k}>
                {menuCustom(routeItem, module.icon, module)}
              </React.Fragment>
            );
          }
          return null;
        })}
      </SubMenu>
    );
  }

  return (
    <div
      className="menu-left-bar"
      style={{
        paddingBottom: prop.prop.isMobile == true ? "40px" : null,
        paddingTop: "20px",
      }}
    >
      <Sidebar
        collapsed={prop.prop.isMobile == true ? false : prop.prop.menuCollaped}
        className="custom-sidebar"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <Menu
          closeOnClick
          menuItemStyles={{
            button: ({ level, active }) => ({
              backgroundColor: active ? clickBackgroundActive : "white",
              color: active ? "#fff" : "#1a3c2a",
              borderRadius: "8px",
              fontWeight: active ? "600" : "400",
              "&:hover": {
                backgroundColor: hoverBackground,
                color: clickBackgroundActive,
              },
            }),
          }}
        >
          {initialPermissionsArray_Parent.map((row, i) => {
            if (!row.hidden_menu) {
              return View_SubMenu(row, i);
            }
          })}
        </Menu>
      </Sidebar>
    </div>
  );
}

export default MenuLeftBar;
