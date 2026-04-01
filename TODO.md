# Facility Inventory API Redo - TODO

## Steps:


- [ ] 3. Update useEffect: on tab change call loadFilteredInventory(activeTab); search filters current filteredInventory (client-side only)
- [ ] 4. Fix table: `key={item.id || index}`, `threshold={item.threshold ?? 'N/A'}`, status based on tab or API
- [ ] 5. Remove client-side low/expiry filters from useEffect
- [ ] 6. Test & complete
