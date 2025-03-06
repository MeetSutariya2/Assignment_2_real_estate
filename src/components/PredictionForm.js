import React, { useState, useEffect } from "react";
import "./PredictionForm.css";


// ✅ Corrected location mapping (Numbers stored, Names displayed)
const locations = [
  { id: 1, name: "Downtown" },
  { id: 2, name: "Suburb" },
  { id: 3, name: "Rural" },
 
];  

const PredictionForm = ({ onPredict }) => {
  const [formData, setFormData] = useState({
    area: "",
    bedrooms: "",
    bathrooms: "",
    location: "", 
    age: ""
  });

  const [error, setError] = useState("");
  const [growthRate, setGrowthRate] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // ✅ Load recent predictions from localStorage
    const savedPredictions = JSON.parse(localStorage.getItem("recentPredictions")) || [];
    setRecentPredictions(savedPredictions);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    // ✅ Prevent negative values
    if (numericValue < 0) {
      setError(`${name} cannot be negative!`);
      return;
    }

    setError(""); // Reset error
    setFormData({ ...formData, [name]: value });

    // ✅ Automatically update estimated growth rate when age is changed
    if (name === "age") {
      const ageValue = parseFloat(value);
      if (ageValue >= 1 && ageValue <= 30) {
        setGrowthRate((100 - ageValue * 2) / 100); // Example growth rate calculation
      } else {
        setGrowthRate(null);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Input Validation
    if (!formData.area || !formData.bedrooms || !formData.bathrooms || !formData.location || !formData.age) {
      setError("⚠️ All fields are required.");
      return;
    }

    if (formData.area < 100 || formData.area > 10000) {
      setError("⚠️ Area must be between 100 to 10,000 sq ft.");
      return;
    }

    if (formData.bedrooms < 1 || formData.bedrooms > 5) {
      setError("⚠️ Bedrooms must be between 1 to 5.");
      return;
    }

    if (formData.bathrooms < 1 || formData.bathrooms > 5) {
      setError("⚠️ Bathrooms must be between 1 to 5.");
      return;
    }

    if (formData.age < 1 || formData.age > 30) {
      setError("⚠️ Property age must be between 1 to 30 years.");
      return;
    }
    if (!formData.location || isNaN(formData.location)) {
      setError("Invalid input: Please select a location.");
      return;
    }
    

    setError(""); // Clear previous errors

    const predictionData = {
      area: parseFloat(formData.area),
      bedrooms: parseFloat(formData.bedrooms),
      bathrooms: parseFloat(formData.bathrooms),
      location: parseInt(formData.location), // ✅ Store number instead of name
      age: parseFloat(formData.age)
    };

    onPredict(predictionData);

    // ✅ Save last 3 predictions
    const updatedPredictions = [predictionData, ...recentPredictions.slice(0, 2)];
    setRecentPredictions(updatedPredictions);
    localStorage.setItem("recentPredictions", JSON.stringify(updatedPredictions));
  };

  return (
    <div className={`prediction-form ${darkMode ? "dark-mode" : ""}`}>
      <h2>Enter Property Details</h2>
      {error && <p className="alert alert-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="form-container">
        <input type="number" name="area" placeholder="Area (sq ft)" onChange={handleChange} className="form-control mb-2" />

        <input type="number" name="bedrooms" placeholder="Bedrooms" onChange={handleChange} className="form-control mb-2" />

        <input type="number" name="bathrooms" placeholder=" Bathrooms" onChange={handleChange} className="form-control mb-2" />

        {/* ✅ Location Dropdown with mapped numbers */}
        <select name="location" className="form-control mb-2" onChange={handleChange} required>
          <option value="">Select Location</option> {/* Default option */}
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} {/* Show Name but Store Number */}
            </option>
          ))}
        </select>

        <input type="number" name="age" placeholder="Age of Property" onChange={handleChange} className="form-control mb-2" />

        {/* ✅ Estimated Growth Rate */}
        {growthRate !== null && (
          <p className="growth-rate">Estimated Growth Rate: {Math.round(growthRate * 100)}%</p>
        )}

        <button type="submit" className="btn btn-primary w-100"> Predict Price</button>
      </form>

      {/* ✅ Recent Searches */}
      {recentPredictions.length > 0 && (
        <div className="recent-predictions mt-3">
          <h3>Recent Predictions</h3>
          <ul className="list-group">
            {recentPredictions.map((item, index) => (
              <li key={index} className="list-group-item">
                {item.area} sq ft | {item.bedrooms} Beds | {item.bathrooms} Baths |  {locations.find(loc => loc.id === item.location)?.name} | {item.age} yrs
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ Dark Mode Toggle */}
      <button className="btn btn-dark mt-3" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀ Switch to Light Mode" : "🌙 Enable Dark Mode"}
      </button>
    </div>
  );
};

export default PredictionForm;
