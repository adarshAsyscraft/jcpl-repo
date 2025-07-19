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
  // Capitalize and format field names like "reportingDateTime" -> "Reporting Date Time"
  const formatLabel = (field) => {
    return field
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  console.log("disableFields::", disableFields);

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
          disabled={disableFields === true ? true : false}
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
            {Object.keys(row).map((field, i) => (
              <Col key={i} md="3" style={{ marginBottom: "10px" }}>
                <label>{formatLabel(field)}</label>
                <input
                  type={
                    field.toLowerCase().includes("date")
                      ? "datetime-local"
                      : "text"
                  }
                  className="form-control"
                  value={row[field]}
                  placeholder={formatLabel(field)}
                  onChange={(e) =>
                    handleChangeDynamic(index, field, e.target.value)
                  }
                />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default DynamicForm;
