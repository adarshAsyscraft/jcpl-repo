import React from "react";

const SelectableInput = ({ label, name, value, handleChange }) => {
  const isOutside = name === "outSide" || name === "underStructure";
  const options = isOutside ? ["not-sighted"] : ["ok"];

  // Check if value is an object (onHireSurvey) or string (normal)
  const selectedValue =
    typeof value === "object" && value !== null
      ? value.condition || ""
      : value || "";

  const isCustom = selectedValue && !options.includes(selectedValue);

  const handleSelectChange = (e) => {
    const selected = e.target.value;

    if (selected === "custom") {
      triggerChange("");
    } else {
      triggerChange(selected);
    }
  };

  const handleInputChange = (e) => {
    const upperCaseValue = e.target.value.toUpperCase();
    triggerChange(upperCaseValue);
  };

  const triggerChange = (val) => {
    // Handle both object and string value types
    if (typeof value === "object" && value !== null) {
      handleChange({
        target: {
          name: `${name}.condition`,
          value: val,
        },
      });
    } else {
      handleChange({
        target: {
          name,
          value: val,
        },
      });
    }
  };

  return (
    <div className="mb-3">
      <label className="mb-1">{label}</label>
      <select
        className="form-select mb-1"
        value={isCustom ? "custom" : selectedValue}
        onChange={handleSelectChange}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="custom">Other</option>
      </select>

      {(isCustom || selectedValue === "") && (
        <input
          type="text"
          className="form-control mt-3"
          placeholder="Enter custom value"
          value={selectedValue}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
};

export default SelectableInput;
