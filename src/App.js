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
    const [feedbackList, setFeedbackList] = useState([]); // Store feedback responses

    // ✅ Load model from LocalStorage or train a new model
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

    // ✅ Train the Neural Network
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

        net.train(formattedData, { iterations: 2000, errorThresh: 0.005 });

        console.log("✅ Model Training Completed");

        // ✅ Save trained model in LocalStorage
        localStorage.setItem("trainedModel", JSON.stringify(net.toJSON()));

        setTrainedNet(net);
    };

    // ✅ Predict property price
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

        console.log("📌 User Input:", input);

        const output = trainedNet.run(input);

        console.log("📌 Raw Prediction Output:", output);

        if (output && output.price) {
            const predicted = output.price * 1000;
            setPredictedPrice(predicted);
            console.log("✅ Predicted Price:", predicted);

            // ✅ Update Chart Data
            setChartData({
                labels: ["Actual Price", "Predicted Price"],
                datasets: [
                    {
                        label: "Price ($1000s)",
                        data: [
                            data.length > 0 ? data[0]["Price (in $1000)"] : 0,
                            predicted
                        ],
                        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"]
                    }
                ]
            });
        } else {
            console.error("❌ Prediction failed: No output from model.");
            alert("Prediction failed. Please check your input values.");
        }
    };

    // ✅ Handle feedback submission
    const handleFeedbackSubmit = (feedback) => {
        setFeedbackList([...feedbackList, feedback]);
        console.log("📌 New Feedback Received:", feedback);
    };

    // ✅ Clear stored model
    const clearModel = () => {
        localStorage.removeItem("trainedModel");
        setTrainedNet(null);
        console.log("🚀 Model cleared from LocalStorage.");
        alert("Trained model has been removed. Please refresh the page to retrain.");
    };

    return (
        <div className="container text-center mt-5">
            <h1 className="text-white mb-4">🏡 Real Estate Price Prediction</h1>

            <div className="card p-4 shadow-lg">
                
                {/* Prediction Form Component */}
                <PredictionForm onPredict={handlePredict} />

                {error && <p className="text-danger mt-2">{error}</p>}

                {predictedPrice && <h2 className="text-success mt-3">Predicted Price: ${predictedPrice.toFixed(2)}</h2>}
                

                {chartData && (
                    <div className="mt-4">
                        <h3 className="text-primary">📊 Prediction Comparison</h3>
                        <div style={{ width: "500px", margin: "auto" }}>
                            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                )}

                <button type="button" className="btn btn-danger mt-3" onClick={clearModel}>
                    Clear Stored Model
                </button>

                {/* Feedback Component */}
                <Feedback onSubmitFeedback={handleFeedbackSubmit} />

                {/* Display user feedback */}
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
