// src/App.js
import React, { useState, useEffect } from "react";
import { NeuralNetwork } from "brain.js";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import PredictionForm from "./components/PredictionForm";
import Feedback from "./components/Feedback";
import "./App.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App = () => {
    const [trainedNet, setTrainedNet] = useState(null);
    const [predictedPrice, setPredictedPrice] = useState(null);
    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");
    const [feedbackList, setFeedbackList] = useState([]);

    // ✅ Load and Train Model or Fetch from LocalStorage
    useEffect(() => {
        const storedModel = localStorage.getItem("trainedModel");

        if (storedModel) {
            console.log("📌 Loading model from LocalStorage...");
            const net = new NeuralNetwork();
            net.fromJSON(JSON.parse(storedModel));
            setTrainedNet(net);
        } else {
            fetch("/real_estate_data.json")
                .then(response => response.json())
                .then(responseData => {
                    setData(responseData);
                    trainModel(responseData);
                })
                .catch((error) => console.error("❌ Error loading data:", error));
        }
    }, []);

    // ✅ Train Neural Network
    const trainModel = (dataset) => {
        console.log("📌 Training Model with Data:", dataset);

        const net = new NeuralNetwork({ hiddenLayers: [5, 3] });

        const formattedData = dataset.map(item => ({
            input: {
                area: item["Area (sq ft)"] / 10000,
                bedrooms: item.Bedrooms / 10,
                bathrooms: item.Bathrooms / 10,
                location: item.Location / 5,
                age: item["Age of Property (years)"] / 100
            },
            output: { price: item["Price (in $1000)"] / 1000 }
        }));

        net.train(formattedData, { iterations: 3000, errorThresh: 0.005 });

        console.log("✅ Model Training Completed");
        localStorage.setItem("trainedModel", JSON.stringify(net.toJSON()));
        setTrainedNet(net);
    };

    // ✅ Helper: Find Closest Actual Price
    const findClosestMatch = (formData) => {
        let closest = null;
        let minDiff = Infinity;

        data.forEach(item => {
            const itemArea = item["Area (sq ft)"] * 10000;
            const itemBedrooms = item.Bedrooms * 10;
            const itemBathrooms = item.Bathrooms * 10;
            const itemLocation = item.Location * 5;
            const itemAge = item["Age of Property (years)"] * 100;

            const diff = Math.abs(itemArea - formData.area) +
                Math.abs(itemBedrooms - formData.bedrooms) +
                Math.abs(itemBathrooms - formData.bathrooms) +
                Math.abs(itemLocation - formData.location) +
                Math.abs(itemAge - formData.age);

            if (diff < minDiff) {
                minDiff = diff;
                closest = item;
            }
        });

        return closest ? closest["Price (in $1000)"] * 1000 : 0;
    };

    // ✅ Handle Predict
    const handlePredict = (formData) => {
        if (!trainedNet) {
            console.error("❌ Model is not trained yet.");
            alert("Model is not trained yet. Please train it first.");
            return;
        }

        // ✅ Input Validation
        for (const key in formData) {
            if (!formData[key] || isNaN(formData[key])) {
                setError(`Invalid input: ${key} is required.`);
                return;
            }
        }

        setError("");

        const input = {
            area: parseFloat(formData.area) / 10000,
            bedrooms: parseFloat(formData.bedrooms) / 10,
            bathrooms: parseFloat(formData.bathrooms) / 10,
            location: parseFloat(formData.location) / 5,
            age: parseFloat(formData.age) / 100
        };

        console.log("📌 User Input (Normalized):", input);

        const output = trainedNet.run(input);
        console.log("📌 Raw Prediction Output:", output);

        if (output && output.price) {
            const predicted = output.price * 1000000; // To USD
            setPredictedPrice(predicted.toFixed(2));
            console.log("✅ Predicted Price (USD):", predicted);

            // ✅ Find Actual Price Closest Match
            const actualPrice = findClosestMatch(formData);
            console.log("✅ Closest Actual Price (USD):", actualPrice);

            // ✅ Update Chart
            setChartData({
                labels: ["Actual Price", "Predicted Price"],
                datasets: [
                    {
                        label: "Price (USD)",
                        data: [actualPrice, predicted],
                        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"]
                    }
                ]
            });
        } else {
            console.error("❌ Prediction failed: No output from model.");
            alert("Prediction failed. Please check your input values.");
        }
    };

    // ✅ Handle Feedback
    const handleFeedbackSubmit = (feedback) => {
        setFeedbackList([...feedbackList, feedback]);
        console.log("📌 New Feedback Received:", feedback);
    };

    // ✅ Clear Model
    const clearModel = () => {
        localStorage.removeItem("trainedModel");
        setTrainedNet(null);
        console.log("🚀 Model cleared from LocalStorage.");
        alert("Trained model has been removed. Please refresh the page to retrain.");
    };

    return (
        <div className="container text-center mt-5">
            <h1 className="text-white mb-4">Real Estate Price Prediction</h1>

            <div className="card p-4 shadow-lg">
                <PredictionForm onPredict={handlePredict} />
                {error && <p className="text-danger mt-2">{error}</p>}

                {predictedPrice && <h2 className="text-success mt-3">Predicted Price: ${predictedPrice}</h2>}

                {chartData && (
                    <div className="mt-4">
                        <h3 className="text-primary">📊 Prediction vs Actual</h3>
                        <div style={{ width: "500px", margin: "auto" }}>
                            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                )}

                <button type="button" className="btn btn-danger mt-3" onClick={clearModel}>Clear Stored Model</button>

                <Feedback onSubmitFeedback={handleFeedbackSubmit} />

                {feedbackList.length > 0 && (
                    <div className="mt-3">
                        <h4>🗣 User Feedback</h4>
                        <ul className="list-group">
                            {feedbackList.map((feedback, index) => (
                                <li key={index} className="list-group-item">{feedback}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
