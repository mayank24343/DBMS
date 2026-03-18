import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLowStockAlerts, getNearExpiryAlerts } from '../services/api';

const InventoryDashboard = () => {
    const { facId } = useParams();
    const [lowStock, setLowStock] = useState([]);
    const [expiring, setExpiring] = useState([]);

    useEffect(() => {
        // Fetch both alerts simultaneously
        getLowStockAlerts(facId).then(data => setLowStock(data));
        getNearExpiryAlerts(facId).then(data => setExpiring(data));
    }, [facId]);

    const handleOrder = (itemName, shortfall) => {
        alert(`Initiating automated Supplier Order for ${shortfall} units of ${itemName}...`);
    };

    return (
        <div>
            <h1>Supply Chain Logistics</h1>
            <h2>Facility ID: {facId}</h2>
            <hr />

            <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
                
                {/* LOW STOCK TABLE */}
                <div style={{ flex: 1 }}>
                    <h3 style={{ color: "darkred" }}>⚠️ Critical Low Stock</h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead style={{ backgroundColor: "#fee2e2" }}>
                            <tr>
                                <th>Item Name</th>
                                <th>Current Qty</th>
                                <th>Threshold</th>
                                <th>Shortfall</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStock.length === 0 ? (
                                <tr><td colSpan="5">Stock levels nominal.</td></tr>
                            ) : (
                                lowStock.map((item) => (
                                    <tr key={item.id}>
                                        <td><strong>{item.item_name}</strong> ({item.item_type})</td>
                                        <td style={{ color: "red", fontWeight: "bold" }}>{item.quantity}</td>
                                        <td>{item.threshold}</td>
                                        <td>{item.shortfall}</td>
                                        <td>
                                            <button onClick={() => handleOrder(item.item_name, item.shortfall)}>
                                                Auto-Order
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* EXPIRING SOON TABLE */}
                <div style={{ flex: 1 }}>
                    <h3 style={{ color: "darkorange" }}>⏱️ Expiring within 30 Days</h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead style={{ backgroundColor: "#ffedd5" }}>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiring.length === 0 ? (
                                <tr><td colSpan="4">No items expiring soon.</td></tr>
                            ) : (
                                expiring.map((item) => {
                                    // Quick logic to flag already expired items
                                    const isExpired = new Date(item.expiry) < new Date();
                                    return (
                                        <tr key={item.id}>
                                            <td><strong>{item.item_name}</strong></td>
                                            <td>{item.quantity}</td>
                                            <td style={{ color: isExpired ? "red" : "black" }}>
                                                {item.expiry}
                                            </td>
                                            <td>
                                                {isExpired ? (
                                                    <span style={{ color: "red", fontWeight: "bold" }}>EXPIRED - DISCARD</span>
                                                ) : (
                                                    <span>Action Required</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default InventoryDashboard;