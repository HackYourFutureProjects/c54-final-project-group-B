import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "../../styles/CreateListing.css";
import TEST_ID from "./CreateListing.testid";

const CreateListing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    brand: "",
    model: "",
    year: "",
    condition: "",
    images: [], // This will now store the Base64 strings to send to the server
  });

  const [previews, setPreviews] = useState([]); // Temporary Blob URLs for fast UI preview
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const conditionOptions = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ];

  const { isLoading, error, performFetch } = useFetch("/listings", (data) => {
    setSuccessMessage("Listing created successfully!");
    setFormError("");
    const timer = setTimeout(() => {
      navigate(`/listings/${data.result._id}`);
    }, 1500);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCondition = (value) => {
    setFormData((prev) => ({ ...prev, condition: value }));
    setIsDropdownOpen(false);
  };

  // Helper to convert File to Base64 for the database
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (previews.length + files.length > 5) {
      setFormError("You can only upload a maximum of 5 images.");
      return;
    }

    // 1. Create immediate Blob URL previews for the UI
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // 2. Convert files to Base64 strings for the actual Data Submission
    try {
      const base64Promises = files.map((file) => fileToBase64(file));
      const base64Images = await Promise.all(base64Promises);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Images],
      }));
      setFormError("");
    } catch {
      setFormError("Error processing images. Please try smaller files.");
    }
  };

  const removeImage = (indexToRemove) => {
    // Cleanup the Blob URL
    URL.revokeObjectURL(previews[indexToRemove]);

    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.location
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (formData.images.length === 0) {
      setFormError("Please upload at least one image of your bike.");
      return;
    }

    // Prepare exactly what the backend expects
    const listingData = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      location: formData.location,
      images: formData.images, // Now contains real Base64 data from your PC!
    };

    if (formData.brand) listingData.brand = formData.brand;
    if (formData.model) listingData.model = formData.model;
    if (formData.year) listingData.year = Number(formData.year);
    if (formData.condition) listingData.condition = formData.condition;

    performFetch({
      method: "POST",
      body: JSON.stringify({ listing: listingData }),
    });
  };

  return (
    <div className="create-listing-page" data-testid={TEST_ID.container}>
      <Link to="/" className="create-listing__back">
        ← Back to Marketplace
      </Link>

      <div className="create-listing-card">
        <header className="card-header-purple">
          <h1>Sell Your Bike</h1>
          <p>Your photos will now be saved directly to the database.</p>
        </header>

        <div className="card-body-content">
          <form onSubmit={handleSubmit} className="create-listing__form">
            {successMessage && (
              <div className="create-listing__success">{successMessage}</div>
            )}
            {(formError || error) && (
              <div className="create-listing__error">
                {formError ||
                  (error && error.message) ||
                  "Error creating listing."}
              </div>
            )}

            <div className="create-listing__image-section">
              <label>Bike Photos *</label>
              <div className="image-gallery">
                {previews.map((url, index) => (
                  <div key={index} className="gallery-item">
                    <img src={url} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      className="remove-img-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {previews.length < 5 && (
                  <button
                    type="button"
                    className="add-image-trigger"
                    onClick={triggerFileInput}
                  >
                    <span className="plus-icon">+</span>
                    <span>Add Photo</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden-file-input"
                multiple
                accept="image/*"
              />
              <p className="input-hint">
                Maximum 5 photos. These will be encoded and saved.
              </p>
            </div>

            <div className="create-listing__group">
              <label htmlFor="title">Listing Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Silver Hybrid City Bike"
                required
              />
            </div>

            <div className="create-listing__group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Give your bike a great story..."
                rows={4}
                required
              />
            </div>

            <div className="create-listing__grid">
              <div className="create-listing__group">
                <label htmlFor="price">Price (€) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="500"
                  min="0"
                  required
                />
              </div>

              <div className="create-listing__group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Amsterdam"
                  required
                />
              </div>

              <div className="create-listing__group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Giant"
                />
              </div>

              <div className="create-listing__group">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Escape"
                />
              </div>

              <div className="create-listing__group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2015"
                />
              </div>

              <div className="create-listing__group">
                <label>Condition</label>
                <div className="custom-dropdown" ref={dropdownRef}>
                  <div
                    className={`dropdown-selected ${isDropdownOpen ? "open" : ""}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {formData.condition
                      ? conditionOptions.find(
                          (o) => o.value === formData.condition,
                        ).label
                      : "Select condition"}
                  </div>
                  {isDropdownOpen && (
                    <div className="dropdown-options">
                      {conditionOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`dropdown-option ${formData.condition === option.value ? "selected" : ""}`}
                          onClick={() => handleSelectCondition(option.value)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="create-listing__submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving Photo Data..." : "Publish Listing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
