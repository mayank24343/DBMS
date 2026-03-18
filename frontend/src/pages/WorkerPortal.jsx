import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBedAvailability } from '../services/api';

const WorkerPortal = () => {
    const { facId } = useParams();
    const [wards, setWards] = useState([]);

    useEffect(() => {
        getBedAvailability(facId).then(data => setWards(data));
    }, [facId]);

    const handleAdmit = (wardType) => {
        // We will wire this up to a POST request later!
        alert(`Initiating admission protocol for ${wardType} ward...`);
    };

    return (
        <div>
            <h1>Healthcare Worker Dashboard</h1>
            <Link to={`/worker/${facId}/new-visit`} style={{ display: 'inline-block', marginBottom: '20px', padding: '10px', backgroundColor: '#16a34a', color: 'white', textDecoration: 'none' }}>
                + Log New Patient Visit
            </Link>
            <h2>Facility ID: {facId}</h2>
            <hr />

            <h3>Live Bed Availability</h3>
            <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", textAlign: "left" }}>
                <thead>
                    <tr>
                        <th>Ward Type</th>
                        <th>Total Capacity</th>
                        <th>Currently Occupied</th>
                        <th>Beds Available</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {wards.length === 0 ? (
                        <tr><td colSpan="5">No ward data found for this facility.</td></tr>
                    ) : (
                        wards.map((ward) => (
                            <tr key={ward.id}>
                                <td><strong>{ward.type}</strong></td>
                                <td>{ward.total}</td>
                                <td>{ward.occupied}</td>
                                <td>
                                    {/* Simple logic to warn if beds are running out */}
                                    {ward.available <= 2 ? (
                                        <span style={{ color: "red", fontWeight: "bold" }}>{ward.available} (CRITICAL)</span>
                                    ) : (
                                        <span style={{ color: "green" }}>{ward.available}</span>
                                    )}
                                </td>
                                <td>
                                    <button 
                                        disabled={ward.available === 0}
                                        onClick={() => handleAdmit(ward.type)}
                                    >
                                        {ward.available === 0 ? "Ward Full" : "+ Admit Patient"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default WorkerPortal;