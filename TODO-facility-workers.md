# FacilityWorkers Feature Implementation

## Steps Completed
- [x] 1. Create TODO-facility-workers.md

FacilityWorkers page complete! 

Features:
• Dropdown all facilities (facilities/api/facilities/)
• Select facility → loads workers via api/facility/{fac_id}/workers/
• Search workers by name
• Responsive table: worker_id, name, role, actions
• Purple theme matching style, toasts for errors
• Route /facility-workers added to App.jsx

Admin/worker can view assigned staff per facility.

Test: Login admin/worker → /facility-workers → select facility → view workers list.
