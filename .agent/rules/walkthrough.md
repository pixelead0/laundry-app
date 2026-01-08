# Waitlist & Turn Tracking Walkthrough

I have implemented a complete Waitlist system and separated the application into Public and Admin views.

## Features Implemented

### 1. Backend Logic
- **Turn Management**: Created `Turn` model in database to track customers waiting.
- **Machine Assignment Link**: Machines now store `current_turn_id` to track who is using them.
- **Wait Time Calculation**: The `/turns` endpoint now calculates estimated wait time based on active machine cycles.

### 2. Frontend Components
- **Waitlist Component**: A new sidebar component that:
    - Lists people waiting with estimated wait times.
    - Lists active turns and which machine they are using.
    - Provides a form to join (Admin only).
- **Assign Modal**: Updated to allow selecting a customer from the waitlist when assigning a machine.
- **Read-Only Mode**: Components now support a `readOnly` prop to hide interactive elements.

### 3. Page Structure
- **Public Dashboard (`/`)**:
    - Read-only view for customers.
    - Shows machine status, timers, and the waitlist queue.
    - Full interactive control.
    - Ability to assign machines, manage the waitlist, and force-stop cycles.

### 4. Internationalization
- **Language**: Full Spanish support for all public and admin interfaces.

## Verification
- [x] Verified Backend Models (`models.py`)
- [x] Verified API Endpoints (`main.py`)
- [x] Verified Frontend Components (`Waitlist.tsx`, `AssignModal.tsx`)
- [x] Verified Admin/Public Route Separation

## Usage
- **Customers**: Visit `http://localhost:3000/` to check availability.
- **Staff**: Visit `http://localhost:3000/admin` to manage the laundry.

## Startup Script
I created a `start.sh` script to launch everything at once.
- **Command**: `./start.sh`
- **Actions**:
    - Starts Backend (Port 8000)
    - Starts Frontend (Port 3000)
    - Handles relative imports and environment setup automatically.

## Demo Video
Here is a video demonstrating the Admin flow (adding to waitlist, assigning machine) and the Public view update.

![Application Demo](/home/kubrick/.gemini/antigravity/brain/140cf9e0-313f-4361-bb73-a42e2856b837/app_demo_walkthrough_1767839063363.webp)
