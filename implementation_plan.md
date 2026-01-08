# Waitlist & Turn Tracking Implementation
The goal is to implement a waitlist system where customers receive a "Turn Number" and can be assigned to machines. Occupied machines will display the Turn Number of the customer currently using them.

## [x] Waitlist Logic (Complete)
- [x] Add 'type' to Turn model
- [x] Update endpoints to handle type
- [x] Update frontend to filter Waitlist by type
- [x] Update Waitlist UI to show both lists in Public view (Stacked)

## [x] Resilience & Maintenance (Complete)
- [x] Implement `/maintenance` endpoint to flag broken machines.
- [x] Implement `/cancel` endpoint to undo assignments.
- [x] Auto-requeue logic: Users are returned to the waitlist if their machine fails.

## [x] Timer & UI (Complete)
- [x] Fix timezone handling for Timer (Timezone-aware UTC).
- [x] Implement Negative Countdown and Blinking for Overdue machines.
- [x] Custom sorting: Machines follow `machine_order`.

## [x] Operations (Complete)
- [x] Unified `start.sh` with log separation (`backend.log`, `frontend.log`) and color-coded prefixing.

## Proposed Changes (Archive)

### Backend (`/backend`)

#### [x] [models.py](file:///home/kubrick/www/laundry-app/laundry-app/backend/models.py)
- **Machine**: Added `current_turn_id`, `machine_order`, `default_cycle_time`.
- **Turn**: Added `type` (washer/dryer) and `status`.

#### [x] [main.py](file:///home/kubrick/www/laundry-app/laundry-app/backend/main.py)
- **Endpoints**:
    - `GET /turns`: Returns queue with estimated wait.
    - `POST /turns`: Join queue by type.
    - `POST /machines/{id}/assign`: Links turn and machine.
    - `POST /machines/{id}/complete`: Releases machine.
    - `POST /machines/{id}/maintenance`: Sets status to maintenance.
    - `POST /machines/{id}/cancel`: Undo assignment.

### Frontend (`/frontend`)

#### [x] [app/admin/page.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/app/admin/page.tsx)
- Full interactive panel with Waitlist Tabs and Settings.

#### [x] [app/page.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/app/page.tsx)
- Read-only Public Dashboard with stacked waitlists.

#### [x] [components/Waitlist.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/components/Waitlist.tsx)
- Supports `readOnly` mode and conditional stacking.

#### [x] [components/MachineCard.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/components/MachineCard.tsx)
- Negative timer logic and blinking overdue state.

#### [x] [stores/useMachineStore.ts](file:///home/kubrick/www/laundry-app/laundry-app/frontend/stores/useMachineStore.ts)
- Zustand state for machines and turns.

## Verification Plan (Complete)
1.  **Split Queue Check**: Join as "Washer", verify it appears in Washer tab.
2.  **Maintenance Check**: Mark machine as maintenance, verify turn is re-queued.
3.  **Timer Check**: Assign 1 min, wait, verify negative count and red blink.
4.  **Log Check**: Run `./start.sh`, verify `[BACKEND]` and `[FRONTEND]` prefixes.
