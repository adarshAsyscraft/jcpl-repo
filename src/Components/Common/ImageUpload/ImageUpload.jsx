import React from "react";
import { useRef } from "react";

const ImageUploadWithPreview = ({ images, setImages }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div className="image-upload-container">
      <div className="d-flex flex-wrap gap-2 mb-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="position-relative"
            style={{ width: "100px", height: "100px" }}
          >
            <img
              src={image.preview}
              alt={`preview ${index}`}
              className="img-thumbnail h-100 w-100 object-fit-cover"
            />
            <button
              type="button"
              className="btn btn-danger btn-sm position-absolute top-0 end-0"
              onClick={() => removeImage(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        multiple
        accept="image/*"
        className="d-none"
      />

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => fileInputRef.current.click()}
      >
        Upload Images
      </button>
    </div>
  );
};

export default ImageUploadWithPreview;
