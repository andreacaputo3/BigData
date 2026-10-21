const fs = require("fs");
const path = require("path");
const fastcsv = require("fast-csv");
const { MongoClient } = require("mongodb");
const pLimit = require("p-limit");

const uri = "mongodb://mongo:27017";
const dbName = "openaq_db";
const collectionName = "measurements";

const dataDirectory = "./data";

// normalizzazione dati
function normalizeRow(row, city) {
    return {
        location_id: row.location_id?.trim(),
        location_name: city,
        parameter: row.parameter?.trim().toLowerCase(),
        value: parseFloat(row.value),
        unit: row.unit?.trim(),
        datetimeUtc: new Date(row.datetimeUtc),
        datetimeLocal: new Date(row.datetimeLocal),
        timezone: row.timezone?.trim(),
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        provider: row.provider?.trim(),
    };
}

// validazione
function isValidRow(normalizedRow) {
    return (
        normalizedRow.location_id &&
        normalizedRow.datetimeUtc &&
        normalizedRow.parameter &&
        !isNaN(normalizedRow.latitude) &&
        !isNaN(normalizedRow.longitude) &&
        !isNaN(normalizedRow.value)
    );
}

function createBulkOperation(normalizedRow) {
    return {
        updateOne: {
            filter: {
                location_id: normalizedRow.location_id,
                datetimeUtc: normalizedRow.datetimeUtc,
                parameter: normalizedRow.parameter,
            },
            update: { $setOnInsert: normalizedRow },
            upsert: true,
        },
    };
}

async function performBulkWrite(client, bulkOperations) {
    const collection = client.db(dbName).collection(collectionName);
    if (bulkOperations.length === 0) return;

    try {
        await collection.bulkWrite(bulkOperations, { ordered: false });
    } catch (error) {
        console.error("Error during bulk write:", error);
    }
}

async function importCSV(client, filePath, city) {
    let bulkOperations = [];
    let skippedRows = 0;

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(fastcsv.parse({ headers: true, skipEmptyLines: true }))
            .on("data", (row) => {
                const normalizedRow = normalizeRow(row, city);

                if (isValidRow(normalizedRow)) {
                    bulkOperations.push(createBulkOperation(normalizedRow));
                } else {
                    skippedRows++;
                }

                if (bulkOperations.length >= 5000) {
                    performBulkWrite(client, bulkOperations);
                    bulkOperations = [];
                }
            })
            .on("end", async () => {
                if (bulkOperations.length > 0) {
                    await performBulkWrite(client, bulkOperations);
                }
                console.log(
                    "File processed:", filePath, "| Skipped rows:", skippedRows
                );
                resolve();
            })
            .on("error", (err) => reject(err));
    });
}

function determineCity(filePath) {
    const city = path.basename(path.dirname(filePath));
    const validCities = ["Roma", "Milano"];

    return validCities.includes(city) ? city : null;
}

function getAllCSVFiles(dirPath) {
    let files = [];
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            files = files.concat(getAllCSVFiles(fullPath));
        } else if (stats.isFile() && fullPath.endsWith(".csv")) {
            files.push(fullPath);
        }
    });

    return files;
}

async function importAllCSV() {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();

        console.time("Total Processing Time");

        const files = getAllCSVFiles(dataDirectory);
        const limit = pLimit(8);

        await Promise.all(
            files.map((file) =>
                limit(async () => {
                    const city = determineCity(file);
                    if (!city) {
                        console.warn("Skipped file", file, ": Unknown city");
                        return;
                    }
                    await importCSV(client, file, city);
                })
            )
        );

        console.timeEnd("Total Processing Time");
        console.log("All files processed.");
    } catch (err) {
        console.error("Error during import:", err);
    } finally {
        if (client) {
            await client.close();
            console.log("MongoDB connection closed.");
        }
    }
}

importAllCSV();
