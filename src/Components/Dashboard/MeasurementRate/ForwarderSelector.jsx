import React from "react";
import { Checkbox, Button } from "antd";

const ForwarderSelector = ({ forwarders, selectedLines, setSelectedLines }) => {
  const allForwarderIds = forwarders.map((fwd) => fwd.id);

  const handleSelectAll = () => {
    setSelectedLines(allForwarderIds);
  };

  const handleSelectNone = () => {
    setSelectedLines([]);
  };

  const handleCheckboxChange = (id) => {
    if (selectedLines.includes(id)) {
      setSelectedLines(selectedLines.filter((fid) => fid !== id));
    } else {
      setSelectedLines([...selectedLines, id]);
    }
  };

  return (
    <div>
      {forwarders.length === 0 ? (
        <p>No forwarders available</p>
      ) : (
        <>
          {forwarders.map((forwarder) => (
            <div key={forwarder.id} style={{ marginBottom: "6px" }}>
              <Checkbox
                checked={selectedLines.includes(forwarder.id)}
                onChange={() => handleCheckboxChange(forwarder.id)}
              >
                {forwarder.name}
              </Checkbox>
            </div>
          ))}

          <div className="mt-3">
            <Button onClick={handleSelectAll} type="primary" size="small">
              Select All
            </Button>{" "}
            <Button onClick={handleSelectNone} size="small" danger>
              Select None
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ForwarderSelector;
