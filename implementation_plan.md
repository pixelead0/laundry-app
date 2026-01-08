# Waitlist & Turn Tracking Implementation

The goal is to implement a waitlist system where customers receive a "Turn Number" and can be assigned to machines. Occupied machines will display the Turn Number of the customer currently using them.

## Proposed Changes

### Backend (`/backend`)

#### [MODIFY] [models.py](file:///home/kubrick/www/laundry-app/laundry-app/backend/models.py)
- **Machine**: Add `current_turn_id` (ForeignKey to Turn) to easily track who is using it.
- **Turn**: Ensure `status` ('waiting', 'in_progress', 'completed', 'cancelled') is effectively used.

#### [MODIFY] [main.py](file:///home/kubrick/www/laundry-app/laundry-app/backend/main.py)
- **New Endpoints**:
    - `GET /turns`: List all turns with status='waiting' (queue).
        - **Logic for Wait Time**:
            - For each waiting user, calculate `estimated_wait`.
            - *Algorithm*:
                - Retrieve all machines of desired type (Washer/Dryer).
                - Sort occupied machines by `current_cycle_end` (ascending).
                - 1st in line waits for: `(Earliest Finish Time) - Now`.
                - 2nd in line waits for: `(2nd Earliest Finish Time) - Now`.
                - If queue length > machine count, add standard cycle duration (30m) to the earliest finished machine's time.
    - `POST /turns`: Create a new turn (Customer Name, Phone? -> Return Turn ID).
- **Update Endpoints**:
    - `POST /machines/{id}/assign`: Accept `turn_id` (optional).
        - If `turn_id` is present:
            - Update `Turn` status to `in_progress`.
            - Set `Machine.current_turn_id` = `turn_id`.
        - Broadcast message should include `current_turn_id`.
    - `POST /machines/{id}/complete`:
        - Find linked `Turn`, set status to `completed`.
        - Set `Machine.current_turn_id` = `None`.

### Frontend (`/frontend`)

#### [NEW] [app/admin/page.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/app/admin/page.tsx)
- Replicates the current Interactive Dashboard.
- Includes:
    - Machine Grid (Interactive: Assign/Complete).
    - Waitlist Manager (Add turns, view active).
    - AssignModal integration.

#### [MODIFY] [app/page.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/app/page.tsx)
- **Role**: Public Dashboard (Read-Only).
- **Changes**:
    - Remove "Add to Waitlist" form (Show only list).
    - Remove "Assign" buttons from machines (Show only Status/Timer).
    - Show "Recent Assignments" and "Upcoming Turns".

#### [MODIFY] [components/Waitlist.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/components/Waitlist.tsx)
- Add `readOnly` prop.
- If `readOnly`: Hide "Join Waitlist" form.

#### [MODIFY] [components/MachineCard.tsx](file:///home/kubrick/www/laundry-app/laundry-app/frontend/components/MachineCard.tsx)
- Add `readOnly` prop.
- If `readOnly`: Hide "Assign" button.

#### [MODIFY] [stores/useMachineStore.ts](file:///home/kubrick/www/laundry-app/laundry-app/frontend/stores/useMachineStore.ts)
- Add slice for `turns` (waitlist).
- Add actions: `fetchTurns`, `addTurn`, `assignTurnToMachine`.
- **Update**: Use `window.location.hostname` for dynamic API host detection.

### Internationalization (Spanish Support)
- **Goal**: Full Spanish translation of the frontend.
- **Components Affected**:
    - `page.tsx`: "Panel Público", "Lavadoras", "Secadoras".
    - `admin/page.tsx`: "Panel de Administración", "Modo Admin".
    - `MachineCard` & `Waitlist`: All labels, buttons, and status messages ("Disponible", "En Curso", "Finalizado").

### DevOps / Operations

#### [NEW] [start.sh](file:///home/kubrick/www/laundry-app/start.sh)
- **Goal**: Unified startup script for both services.
- **Function**:
    - Kill existing processes on ports 3000/8000.
    - Start Backend (as module `backend.main`).
    - Start Frontend (`npm run dev`).
    - Handle cleanup on exit.

## Verification Plan

### Automated Verification
- Manual verification required as no test suite exists yet.

### Manual Verification
1.  **Add to Waitlist**: Create a user "John", verify they get a Turn ID (e.g. #1).
2.  **Assign**: Assign "John" to Machine W1.
3.  **Visual Check**: Verify Machine W1 card shows "Occupied - Turn #1".
4.  **Waitlist Check**: Verify "John" is removed from the "Waiting" list.
5.  **Complete**: Finish cycle, verify Machine W1 is free and Turn #1 is marked completed (no longer relevant).
