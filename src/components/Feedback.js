// src/components/Feedback.js
import React, { useState } from "react";

const Feedback = () => {
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Thank you for your feedback!");
        setSubmitted(true);
    };

    return (
        <div>
            <h3>Was the prediction accurate?</h3>
            {!submitted ? (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter your feedback..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary w-100">Submit Feedback</button>
                </form>
            ) : (
                <p className="text-success">✅ Feedback submitted! Thank you!</p>
            )}
        </div>
    );
};

export default Feedback;
