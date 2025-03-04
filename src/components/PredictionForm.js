import React, { useState } from "react";

const PredictionForm = ({ onPredict }) => {
  const [formData, setFormData] = useState({
    area: "",
    bedrooms: "",
    bathrooms: "",
    location: "",
    age: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Input Validation
    if (!formData.area || !formData.bedrooms || !formData.bathrooms || !formData.location || !formData.age) {
      setError("All fields are required.");
      return;
    }

    if (formData.area <= 0 || formData.bedrooms <= 0 || formData.bathrooms <= 0 || formData.age <= 0) {
      setError("Values must be greater than zero.");
      return;
    }

    setError(""); // Clear previous errors
    onPredict({
      area: parseFloat(formData.area),
      bedrooms: parseFloat(formData.bedrooms),
      bathrooms: parseFloat(formData.bathrooms),
      location: parseFloat(formData.location),
      age: parseFloat(formData.age),
    });
  };

  return (
    <div>
      <h2>Enter Property Details</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="number" name="area" placeholder="Area (sq ft)" onChange={handleChange} />
        <input type="number" name="bedrooms" placeholder="Bedrooms" onChange={handleChange} />
        <input type="number" name="bathrooms" placeholder="Bathrooms" onChange={handleChange} />
        <input type="number" name="location" placeholder="Location (Encoded)" onChange={handleChange} />
        <input type="number" name="age" placeholder="Age of Property" onChange={handleChange} />
        <button type="submit">Predict Price</button>
      </form>
    </div>
  );
};

export default PredictionForm;
