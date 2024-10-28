const fs = require("fs").promises;

const loadJSONData = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error loading data: ${error.message}`);
    }
};

const loadCSVData = async (filePath) => {
    try {
        const csv = await fs.readFile(filePath, "utf8");
        const lines = csv.trim().split("\n");
        const headers = lines[0].split(",");
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(",");

            headers.forEach((header, index) => {
                obj[header.trim()] =
                    index === 1
                        ? parseFloat(currentLine[index])
                        : new Date(currentLine[index]);
            });

            data.push(obj);
        }

        return data;
    } catch (error) {
        throw new Error(`Error loading data: ${error.message}`);
    }
};

const loadData = async (filePath) => {
    if (filePath.endsWith(".json")) {
        return loadJSONData(filePath);
    } else if (filePath.endsWith(".csv")) {
        return loadCSVData(filePath);
    } else {
        throw new Error("Unsupported file format");
    }
};

module.exports = { loadData };
