import React, { useEffect, useState } from "react";

// Component
import CustomSelect from "../../component/Select/CustomSelect.component";
import CustomAreaValidation from "./CustomAreaValidation";

// Scripts
import ScriptCityProvince from "../../util/area/province_and_city";
import ScriptDistrict from "../../util/area/district";
import ScriptCommue from "../../util/area/commues";
import ScriptVillage from "../../util/area/villages";
import CustomSelect_Script from "../../component/Select/CustomSelect.script";

function CustmArea({
  event,
  columns = 4,
  props,
  provinceCity,
  district,
  commune,
  village,
}) {
  const customAreaValidation = new CustomAreaValidation();
  const customSelect_Script = new CustomSelect_Script();
  const scriptCityProvince = new ScriptCityProvince();
  const scriptDistrict = new ScriptDistrict();
  const scriptCommue = new ScriptCommue();
  const scriptVillage = new ScriptVillage();

  const colClass = `col-md-${12 / parseInt(columns)}`;

  // Choose states
  const [chooseCityProvince, setchooseCityProvince] = useState(null);
  const [chooseDistrict, setchooseDistrict] = useState(null);
  const [chooseCommue, setchooseCommue] = useState(null);
  const [chooseVillage, setchooseVillage] = useState(null);

  useEffect(() => {
    commune.s((prev) => ({
      ...prev,
    }));
  }, []);

  // Load City/Province on mount
  useEffect(() => {
    const list = scriptCityProvince
      .list()
      .map((row) => ({ value: row.id, label: row.name_km }));
    provinceCity.s((prevState) => ({
      ...prevState,
      data: list,
    }));
  }, []);

  // Load District when Province changes
  useEffect(() => {
    if (chooseCityProvince) {
      const list = scriptDistrict
        .list()
        .filter((row) => row.province_id === chooseCityProvince)
        .map((row) => ({ value: row.id, label: row.name_km }));
      district.s((prevState) => ({
        ...prevState,
        data: list,
      }));
    } else {
      district.s((prevState) => ({
        ...prevState,
        data: [],
        value: "",
      }));
      setchooseDistrict(null);
    }
  }, [chooseCityProvince]);

  // Load Commune when District changes
  useEffect(() => {
    if (chooseDistrict) {
      const list = scriptCommue
        .list()
        .filter((row) => row.district_id === chooseDistrict)
        .map((row) => ({ value: row.id, label: row.name_km }));
      commune.s((prevState) => ({
        ...prevState,
        data: list,
      }));
    } else {
      commune.s((prevState) => ({
        ...prevState,
        data: [],
        value: "",
      }));
      setchooseCommue(null);
    }
  }, [chooseDistrict]);

  // Load Village when Commune changes
  useEffect(() => {
    if (chooseCommue) {
      const list = scriptVillage
        .list()
        .filter((row) => row.commune_id === chooseCommue)
        .map((row) => ({ value: row.id, label: row.name_km }));
      village.s((prevState) => ({
        ...prevState,
        data: list,
      }));
    } else {
      village.s((prevState) => ({
        ...prevState,
        data: [],
        value: "",
      }));
      setchooseVillage(null);
    }
  }, [chooseCommue]);

  // Clear input levels helper
  function clearInputLevel(districtLocal, communeLocal, villageLocal) {
    if (districtLocal) {
      setchooseDistrict(null);
      district.s((prevState) => ({
        ...prevState,
        clearValue: true,
      }));
    }

    if (communeLocal) {
      commune.s((prevState) => ({
        ...prevState,
        clearValue: true,
      }));
    }

    if (villageLocal) {
      village.s((prevState) => ({
        ...prevState,
        clearValue: true,
      }));
    }
  }

  return (
    <div className="container-fluid p-0">
      <div className="row">
        <div className={colClass}>
          <CustomSelect
            props={{ select: provinceCity.i }}
            event={(action, e) => {
              event(action, "provinceCity", e);
              customSelect_Script.OnchangeTriggerChangeToAutoCorrection(
                e,
                provinceCity.s,
                true
              );

              setchooseCityProvince(e);
              clearInputLevel(true, true, true);
              // Removed handleListener call here
            }}
          />
        </div>
        <div className={colClass}>
          <CustomSelect
            props={{ select: district.i }}
            event={(action, e) => {
              event(action, "district", e);
              customSelect_Script.OnchangeTriggerChangeToAutoCorrection(
                e,
                district.s,
                true
              );
              setchooseDistrict(e);
              clearInputLevel(false, true, true);
              // Removed handleListener call here
            }}
          />
        </div>
        <div className={colClass}>
          <CustomSelect
            props={{ select: commune.i }}
            event={(action, e) => {
              event(action, "commune", e);
              customSelect_Script.OnchangeTriggerChangeToAutoCorrection(
                e,
                commune.s,
                true
              );
              setchooseCommue(e);
              clearInputLevel(false, false, true);
              // Removed handleListener call here
            }}
          />
        </div>
        <div className={colClass}>
          <CustomSelect
            props={{ select: village.i }}
            event={(action, e) => {
              event(action, "village", e);
              customSelect_Script.OnchangeTriggerChangeToAutoCorrection(
                e,
                village.s,
                true
              );
              setchooseVillage(e);
              // Removed handleListener call here
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CustmArea;
