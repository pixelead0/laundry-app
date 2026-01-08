# Changelog

All notable changes to this project will be documented in this file.

## [v1.4.1] - Stabilization & Sync Fixes
### Fixed
- **Backend Stability**: Resolved a `TypeError` in the `get_turns` endpoint caused by mixed naive/aware datetime comparisons.
- **Sync Accuracy**: Fixed the 'Active Turns' list in both panels by standardizing all calculations to UTC.
- **UI Consistency**: Ensured that the initial REST fetch and subsequent WebSocket updates parse dates identically to avoid "timer jumps".

## [v1.4.0] - Timer Perfection & Infrastructure
### Added
- **Timer Overdue Blink**: Machines now pulse red and count negative time when a cycle is overdue.
- **Improved Logging**: `start.sh` now separates Frontend and Backend logs with colored terminal prefixes.
- **Timezone Awareness**: Initial implementation of UTC across models to prevent timezone-related display bugs.

## [v1.3.0] - Split Waitlists
### Added
- **Washer/Dryer Queues**: Separate waitlists for washers and dryers with tabbed interface in Admin and stacked view in Public Panel.
- **Type Selection**: Users can select the machine type when joining the waitlist.
- **Intelligent Assignment**: Assign modal now filters the waitlist based on the selected machine type.

## [v1.2.0] - Resilience & Multi-Machine Support
### Added
- **Machine Failure Handling**: Ability to report failures, move machines to maintenance, and automatically re-queue affected users.
- **Cancel/Undo**: Admins can now undo an assignment, returning the user to the waitlist.
- **Configurable Machines**: Individual duration and order settings per machine.
- **Machine Editing**: Full CRUD for machines in the Admin panel.

## [v1.1.0] - Admin Refinement
### Added
- **Settings Dialog**: Centralized panel for managing machine configurations.
- **Manual Release**: Button to force-complete a cycle regardless of timer.
- **Validation**: Strict Pydantic schemas for machine responses.

## [v1.0.0] - MVP Complete
- **Features**:
    - Backend: Machines, Turns (Waitlist), WebSocket support.
    - Frontend: Public Dashboard (Read-only), Admin Dashboard (Interactive).
    - **Waitlist**: Full cycle of adding to queue, assigning to machine, and tracking active turns.
- **Improvements**:
    - **Internationalization**: Full Spanish translation (UI).
    - **DevOps**: `start.sh` unified startup script.
    - **Architecture**: Dynamic host detection for local network access.
