import React, { useState, useEffect } from 'react';

const Anomalies = ({ pollutant, startDate, endDate, threshold }) => {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `http://localhost:5000/api/measurements/${pollutant}/trend?startDate=${startDate}&endDate=${endDate}&granularity=daily&threshold=${threshold}`
                );

                if (!response.ok) {
                    throw new Error('Errore nella chiamata API');
                }

                const data = await response.json();
                const filteredAnomalies = data.filter(entry => entry.is_above_threshold);
                setAnomalies(filteredAnomalies);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalies();
    }, [pollutant, startDate, endDate, threshold]);

    if (loading) return <p>Caricamento in corso...</p>;
    if (error) return <p>Errore: {error}</p>;
    if (anomalies.length === 0) return <p>Nessuna anomalia rilevata</p>;

    return (
        <div>
            <h2>Anomalie Rilevate</h2>
            <ul>
                {anomalies.map((anomaly, index) => (
                    <li key={index} style={{ color: 'red', marginBottom: '10px' }}>
                        <strong>Data:</strong> {anomaly._id} <br />
                        <strong>Valore Medio:</strong> {anomaly.average_value.toFixed(2)} <br />
                        <strong>Valore Massimo:</strong> {anomaly.max_value.toFixed(2)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Anomalies;
