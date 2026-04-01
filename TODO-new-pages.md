# New Pages Implementation Plan

## TransferPatient.jsx (similar to DischargePatient.jsx) ✅
- [x] 1. Create TransferPatient.jsx 
- [x] 2. Params visitId, fetch visit info
- [x] 3. Facility dropdown (api.facilities)
- [x] 4. Ward dropdown (getWardAvailability(facId))
- [x] 5. Reason textarea
- [x] 6. POST /api/transfer/ {visit_id, citizen_id, from_fac, to_fac=selectedFacility.id, ward_id, reason}
- [x] 7. Success screen
- [ ] 8. Add route to App.jsx /transfer/:visitId

Current: TransferPatient created, emerald/teal UI, full flow. Need route.

## AddVaccination.jsx (similar to AddDiagnosis.jsx) ✅
- [x] 1. Create AddVaccination.jsx
- [x] 2. Params citizenId 
- [x] 3. Vaccines list (/api/medicines/ filter vaccine)
- [x] 4. Dose no input
- [x] 5. Facility select
- [x] 6. POST /clinical/api/vaccination/ {citizen_id, vaccine_id, dose_no, centre_id, notes}
- [x] 7. Success screen
- [ ] 8. Add route /vaccination/:citizenId

All pages created. Need routes in App.jsx for both.

Followup: Add routes to App.jsx, test.

Confirm endpoints/body or frontend first?

