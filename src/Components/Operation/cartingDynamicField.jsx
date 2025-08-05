import React from "react";
import { Col, Row } from "reactstrap";

const DynamicForm = ({
  rowCount,
  setRowCount,
  rows,
  handleAddRows,
  handleChangeDynamic,
  disableFields,
}) => {
  const formatLabel = (field) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const handleInputChange = (index, field, value) => {
    let processedValue = value;

    // Convert to uppercase for non-date fields
    if (typeof value === "string" && !field.toLowerCase().includes("date")) {
      processedValue = value.toUpperCase();
    }

    // Special handling for date fields
    if (field.toLowerCase().includes("date")) {
      processedValue = formatDateTimeInput(value);
    }

    handleChangeDynamic(index, field, processedValue);
  };

  const formatDateTimeInput = (value) => {
    if (!value) return value;

    // Remove all non-digit characters
    let digitsOnly = value.replace(/[^\d]/g, "");

    // Limit to 12 digits (DDMMYYYYHHMM)
    if (digitsOnly.length > 12) {
      digitsOnly = digitsOnly.substring(0, 12);
    }

    // Format as DD-MM-YYYY :: HH:MM
    let formattedValue = "";
    for (let i = 0; i < digitsOnly.length; i++) {
      if (i === 2 || i === 4) {
        formattedValue += "-"; // Date separators
      } else if (i === 8) {
        formattedValue += " : "; // Date-time separator
      } else if (i === 10) {
        formattedValue += ":"; // Time separator
      }
      formattedValue += digitsOnly[i];
    }

    return formattedValue;
  };

  const validateDateTime = (value) => {
    if (!value) return { isValid: false, message: "" };

    // Only validate when input is complete (19 chars: DD-MM-YYYY :: HH:MM)

    try {
      const [datePart, timePart] = value.split(" : ");
      const [day, month, year] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);

      // Basic validation
      if (
        isNaN(day) ||
        isNaN(month) ||
        isNaN(year) ||
        isNaN(hours) ||
        isNaN(minutes)
      ) {
        return { isValid: false, message: "Invalid format" };
      }

      // Date validation
      const dateObj = new Date(year, month - 1, day);
      const isValidDate =
        dateObj.getFullYear() === year &&
        dateObj.getMonth() === month - 1 &&
        dateObj.getDate() === day;

      if (!isValidDate) {
        return { isValid: false, message: "Invalid date" };
      }

      // Future date validation
      const now = new Date();
      const inputDateTime = new Date(year, month - 1, day, hours, minutes);
      if (inputDateTime > now) {
        return { isValid: false, message: "Cannot be future date/time" };
      }

      // Time validation
      if (hours > 23 || minutes > 59) {
        return { isValid: false, message: "Invalid time (00-23:00-59)" };
      }

      return { isValid: true, message: "" };
    } catch {
      return { isValid: false, message: "Invalid format" };
    }
  };

  return (
    <div className="mt-4">
      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
        <input
          disabled={disableFields}
          className="form-control"
          type="number"
          value={rowCount}
          onChange={(e) => setRowCount(e.target.value)}
          placeholder="Enter number of rows"
          style={{ width: "200px" }}
        />
        <button
          disabled={disableFields}
          onClick={handleAddRows}
          className="btn btn-primary"
        >
          Add Row
        </button>
      </div>

      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            marginBottom: "1rem",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <Row>
            {Object.keys(row).map((field, i) => {
              const isDateField = field.toLowerCase().includes("date");
              const validation = isDateField
                ? validateDateTime(row[field])
                : { isValid: true, message: "" };

              return (
                <Col key={i} md="3" style={{ marginBottom: "10px" }}>
                  <label>{formatLabel(field)}</label>
                  <input
                    type="text"
                    className={`form-control ${
                      isDateField &&
                      !validation.isValid &&
                      row[field]?.length === 19
                        ? "is-invalid"
                        : ""
                    }`}
                    value={row[field] || ""}
                    placeholder={
                      isDateField ? "DD-MM-YYYY : HH:MM" : formatLabel(field)
                    }
                    onChange={(e) =>
                      handleInputChange(index, field, e.target.value)
                    }
                    disabled={disableFields}
                    maxLength={isDateField ? 19 : undefined}
                  />
                  {isDateField && row[field] && (
                    <div
                      className={`small ${
                        validation.isValid ? "text-muted" : "text-danger"
                      }`}
                    >
                      {validation.message ||
                        (row[field].length === 19 ? "Valid" : "")}
                    </div>
                  )}
                </Col>
              );
            })}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default DynamicForm;
