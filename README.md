POST (json):
curl -X POST http://localhost:3001/predict ^-H "Content-Type: application/json" ^-d "{    \"params\": [ { \"name\": \"noiseLevel\", \"value\": 0.3 }, { \"name\": \"adjustmentFactor\", \"value\": 1.2 }    ],    \"filePath\": \"./data/weekly-sales.json\"}"

POST (csv):
curl -X POST http://localhost:3001/predict ^-H "Content-Type: application/json" ^-d "{    \"params\": [ { \"name\": \"noiseLevel\", \"value\": 0.3 }, { \"name\": \"adjustmentFactor\", \"value\": 1.2 }    ],    \"filePath\": \"./data/predict.csv\"}"

POST (no params):
curl -X POST http://localhost:3001/predict ^-H "Content-Type: application/json" ^-d "{ \"filePath\": \"./data/weekly-sales.json\"}"

GET:
curl -X GET http://localhost:3001/prediction
