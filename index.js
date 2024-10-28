const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const loadData = require("./helpers/dataUtils").loadData;

const app = express();
app.use(bodyParser.json());

const NUM_WEEKS = 10; // Number of weeks to predict

let lastPrediction = null;

const linearRegression = (data) => {
    const n = data.length; // Number of data points

    let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0;

    // Calculate sums
    data.forEach((item, index) => {
        const x = index; // x - index (0, 1, 2, ...)
        const y = item.value; // y - value from the data
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
};

const generatePredictions = (
    data,
    slope,
    intercept,
    noiseLevel,
    adjustmentFactor
) => {
    const predictions = [];
    const lastTimestamp = new Date(data[data.length - 1].timestamp);

    for (let i = 1; i <= NUM_WEEKS; i++) {
        const nextTimestamp = new Date(lastTimestamp);
        nextTimestamp.setDate(nextTimestamp.getDate() + i * 7); // Next week
        const nextIndex = data.length + i;
        const baseValue = slope * nextIndex + intercept;

        // Apply noise and adjustment factor to the prediction
        const value =
            (baseValue + noiseLevel * Math.random()) * adjustmentFactor;
        predictions.push({
            timestamp: nextTimestamp.toISOString(),
            value: Math.floor(value), // Round to nearest integer
        });
    }

    return predictions;
};

// Main endpoint for predictions
app.post("/predict", async (req, res) => {
    const { params, filePath } = req.body;

    let data;
    try {
        data = await loadData(filePath);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    // Default params values
    let noiseLevel = 0.1;
    let adjustmentFactor = 1; // 1 - no adjustment, 1.2 - 20% increase, 0.8 - 20% decrease in predicted sales

    if (params) {
        params.forEach((param) => {
            if (param.name === "noiseLevel") {
                noiseLevel = param.value;
            } else if (param.name === "adjustmentFactor") {
                adjustmentFactor = param.value;
            }
        });
    }

    const { slope, intercept } = linearRegression(data);
    const predictions = generatePredictions(
        data,
        slope,
        intercept,
        noiseLevel,
        adjustmentFactor
    );

    lastPrediction = {
        timestamp: new Date().toISOString(),
        params: {
            noiseLevel,
            adjustmentFactor,
        },
        data: predictions,
    };

    console.log(lastPrediction);

    res.json({
        params: {
            noiseLevel,
            adjustmentFactor,
        },
        data: predictions,
    });
});

// Endpoint to get the last prediction
app.get("/prediction", (req, res) => {
    if (lastPrediction) {
        res.json(lastPrediction);
        console.log(lastPrediction);
    } else {
        res.status(404).json({
            message: "No prediction available. Use POST request first.",
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
