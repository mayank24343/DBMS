import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createNewVisit } from '../services/api';

const CreateVisit = () => {
    const { facId } = useParams();
    const navigate = useNavigate(); // Used to redirect after success
    
    // State to hold our form inputs
    const [formData, setFormData] = useState({
        aadhar_no: '',
        facility_id: facId,
        visit_date: new Date().toISOString().split('T')[0], // Defaults to today
        reason: '',
        disease_id: '',
        description: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the page from reloading
        setError('');
        
        try {
            await createNewVisit(formData);
            alert("Visit and Diagnosis recorded successfully!");
            // Redirect the worker back to their main dashboard
            navigate(`/worker/${facId}`); 
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1>Log New Patient Visit</h1>
            <h2>Facility ID: {facId}</h2>
            <hr />

            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                
                <label>
                    <strong>Patient Aadhar Number:</strong><br />
                    <input type="text" name="aadhar_no" required maxLength="12" value={formData.aadhar_no} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </label>

                <label>
                    <strong>Date of Visit:</strong><br />
                    <input type="date" name="visit_date" required value={formData.visit_date} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </label>

                <label>
                    <strong>Reason for Visit (Symptoms):</strong><br />
                    <textarea name="reason" required rows="3" value={formData.reason} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </label>

                <fieldset style={{ padding: '15px', border: '1px solid #ccc' }}>
                    <legend><strong>Diagnosis (Optional)</strong></legend>
                    
                    <label>
                        Disease ID (e.g., 12 for COVID):<br />
                        <input type="number" name="disease_id" value={formData.disease_id} onChange={handleChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                    </label>

                    <label>
                        Doctor's Notes:<br />
                        <textarea name="description" rows="2" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                    </label>
                </fieldset>

                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    Save Patient Record
                </button>
            </form>
        </div>
    );
};

export default CreateVisit;