# Schedule Manager - User Usecase Flow

## Overview

The Schedule Manager is a comprehensive employee scheduling application that helps managers create optimal work schedules by managing employees, setting constraints, and generating automated schedules based on various business rules and employee preferences.

## Core Features

- **Schedule History Management**: Create, view, and manage multiple monthly schedules
- **Employee Management**: Add, edit, and remove employees with custom attributes
- **Constraint Management**: Set global scheduling rules and employee-specific preferences
- **Schedule Generation**: Automatically generate monthly schedules based on constraints
- **Schedule Visualization**: View generated schedules in calendar format
- **Export Functionality**: Export schedules as CSV files or images

---

## User Workflow

### 1. Initial Setup Flow

#### 1.1 Access the Application
- **Entry Point**: User navigates to the Schedule Manager application
- **Landing**: User sees the main interface with three tabs: Setup, Constraints, and Schedule
- **Default View**: Application starts on the "Setup" tab

#### 1.2 Schedule History Management
- **Display**: List of existing schedules shown at the top of Setup tab
- **Format**: Each schedule entry shows month/year and generation status
- **Selection**: User can click on any schedule to select it as the current working schedule
- **Actions**: Each schedule has options to view, delete, or set as active
- **Empty State**: If no schedules exist, shows message prompting to create first schedule

#### 1.3 Adding New Schedule
- **Trigger**: User clicks "Add Schedule" button
- **Process**: Opens month/year selector for new schedule creation, default to current month/year
- **Employee Import Options**:
  - **Auto-Import**: By default, if other schedules exist, employees are automatically copied from the most recent schedule
  - **Manual Selection**: User can choose "Copy employees from" dropdown to select a specific schedule to copy employees from
  - **Start Fresh**: User can opt out of importing and start with an empty employee list
  - **Independence**: Imported employees become independent copies - changes won't affect the original schedule
- **Creation**: New schedule entry added to history list
- **Auto-Selection**: Newly created schedule becomes the active/selected schedule
- **Post-Creation**: User can immediately modify the imported employee list as needed

#### 1.4 Month Selection (for Active Schedule)
- **Action**: User selects the target month and year for the currently active schedule
- **Components**: Month/Year dropdown selectors
- **Validation**: Only valid months/years are selectable
- **Persistence**: Selection is saved and restored on app reload
- **Context**: Changes apply only to the currently selected schedule

### 2. Employee Management Flow

#### 2.1 Employee Data Independence
- **Schedule Isolation**: Each schedule maintains its own independent copy of employee data
- **No Cross-Impact**: Changes to employees in one schedule do not affect other schedules
- **Import Benefits**: New schedules can start with copies of existing employee configurations, reducing setup time

#### 2.2 Adding Employees
- **Context**: Employee management applies to the currently selected schedule
- **Trigger**: User clicks "Add Employee" button
- **Process**: 
  - System creates a new employee with auto-generated name (e.g., "New Employee 001")
  - Default shifts per month set to 8
  - Empty tags array initialized
- **Feedback**: Success toast notification displayed
- **State**: Employee appears in the employee list for the current schedule

#### 2.2 Editing Employee Information
- **Trigger**: User clicks on an employee in the list
- **Editable Fields**:
  - Employee name
  - Shifts per month (numeric input)
  - Tags/attributes (from predefined list)
- **Tag Management**:
  - Predefined tags: "Weekend type", "Burger", "Morning shift", "Evening shift", "Manager", "Part-time"
  - Click to toggle tags on/off for each employee
- **Save**: Changes are saved automatically
- **Feedback**: Success notification on update
- **Scope**: Changes apply only to the currently selected schedule

#### 2.3 Removing Employees
- **Trigger**: User clicks delete button for an employee
- **Process**:
  - Employee removed from employee list for current schedule
  - All associated constraints are removed from current schedule
  - Employee is removed from the current schedule's assignments
- **Confirmation**: Immediate removal (no confirmation dialog)
- **Scope**: Removal only affects the currently selected schedule

### 3. Employee Constraints Flow

#### 3.1 Employee Selection for Constraints
- **Context**: Constraints apply to the currently selected schedule
- **Prerequisite**: At least one employee must exist in the current schedule
- **Process**: User selects an employee from the dropdown
- **Effect**: Calendar view becomes interactive for the selected employee
- **Scope**: Constraint changes only affect the currently active schedule

#### 3.2 Setting Date-Specific Constraints
- **Calendar Interaction**: User clicks on specific dates in the calendar
- **3-State Cycle**: Each click cycles through states:
  1. **Normal** (no constraint) → **Prefer** (green highlight)
  2. **Prefer** → **Avoid** (red highlight)  
  3. **Avoid** → **Normal** (no highlight)
- **Visual Feedback**: Color-coded calendar cells indicate constraint types
- **Persistence**: Constraints are saved automatically to the current schedule
- **Month Context**: Calendar displays the month/year of the currently selected schedule

#### 3.3 Constraint Types
- **Prefer**: Employee would like to work on this date (weighted positively in algorithm)
- **Avoid**: Employee prefers not to work on this date (weighted negatively in algorithm)
- **Normal**: No preference (neutral in algorithm)

### 4. Global Constraints Configuration Flow

#### 4.1 Accessing Constraints Panel
- **Navigation**: User switches to "Constraints" tab
- **View**: Global scheduling rules configuration panel

#### 4.2 Basic Shift Configuration
- **Shifts per Day**: Number of shifts each day (1-3)
- **Persons per Shift**: How many people needed per shift
- **Purpose**: Determines total staffing requirements

#### 4.3 Employee Work Rules
- **Max Consecutive Shifts**: Prevent employee burnout
- **Min Rest Days Between Shifts**: Ensure adequate recovery time
- **Max/Min Shifts per Week**: Control weekly workload distribution
- **Weekend Coverage Required**: Boolean flag for weekend staffing

#### 4.4 Distribution Settings
- **Even Distribution**: Attempt to distribute shifts equally among employees
- **Real-time Updates**: Settings are saved immediately upon change

### 5. Schedule Generation Flow

#### 5.1 Pre-Generation Validation
- **Navigation**: User switches to "Schedule" tab
- **Context**: Generation applies to the currently selected schedule
- **Prerequisites Check**:
  - At least one employee must exist in the current schedule
  - Selected schedule must have a month and year defined
  - Total shifts available ≥ total shifts needed for the current schedule

#### 5.2 Generate Schedule Process
- **Trigger**: User clicks "Generate Schedule" button
- **Loading State**: Button shows loading indicator
- **Algorithm Execution**:
  - Validates shift availability vs. requirements for current schedule
  - Applies employee constraints (prefer/avoid) from current schedule
  - Respects global scheduling rules
  - Distributes shifts according to settings
- **Duration**: Brief artificial delay for user feedback (500ms)
- **Scope**: Generation only affects the currently selected schedule

#### 5.3 Schedule Generation Algorithm Logic
- **Day-by-Day Processing**: Iterates through each day of the month
- **Shift-by-Shift Assignment**: For each shift, assigns required number of people
- **Constraint Application**:
  - Respects "avoid" constraints (hard constraint)
  - Prioritizes "prefer" constraints when possible
  - Maintains consecutive shift limits
  - Enforces rest day requirements
  - Tracks weekly shift counts
- **Employee Selection**:
  - Filters available employees based on constraints
  - Prioritizes employees with "prefer" constraints
  - Randomly selects from available pool if no preferences

#### 5.4 Generation Results
- **Success Case**: 
  - Schedule generated and displayed
  - Success toast with generation message
  - Calendar view populated with assignments
- **Failure Case**:
  - Error toast with specific reason
  - Previous schedule (if any) remains unchanged
  - Common failures: insufficient shifts, impossible constraints

### 6. Schedule Viewing Flow

#### 6.1 Schedule Display
- **Context**: Displays the currently selected schedule
- **Format**: Monthly calendar grid
- **Layout**: 7-column grid (Sunday through Saturday)
- **Day Cells**: Show date and assigned employee names
- **Empty State**: Message prompting to generate schedule for the current selection
- **Header**: Shows the month/year of the currently selected schedule

#### 6.2 Schedule Information
- **Employee Names**: Full names displayed in assigned day cells
- **Multiple Assignments**: Multiple employees per day supported
- **Overflow Handling**: Long names are truncated with tooltips
- **Month/Year Header**: Clear indication of the selected schedule period
- **Context Indicator**: Visual indication of which schedule from history is being viewed

### 7. Export and Sharing Flow

#### 7.1 Export Options
- **Prerequisites**: Currently selected schedule must be generated
- **Available Formats**:
  - CSV export for spreadsheet applications
  - Image export for visual sharing
- **Access**: Export buttons in Schedule Actions panel
- **Context**: Export applies only to the currently selected schedule

#### 7.2 CSV Export Process
- **Trigger**: User clicks CSV export button
- **Validation**: Checks for existing schedule in current selection
- **Process**: Generates CSV file with current schedule data
- **Download**: File automatically downloaded to user's device
- **Feedback**: Success/error toast notification
- **Filename**: Includes month/year for identification

#### 7.3 Image Export Process
- **Trigger**: User clicks image export button
- **Validation**: Checks for existing schedule in current selection
- **Process**: Captures current schedule calendar as image
- **Download**: Image file downloaded to device
- **Feedback**: Success/error toast notification
- **Filename**: Includes month/year for identification

### 8. Data Persistence Flow

#### 8.1 Local Storage Management
- **Auto-Save**: All schedule data automatically saved to browser's localStorage
- **Save Triggers**:
  - Schedule additions/deletions/selections
  - Employee additions/modifications/deletions
  - Constraint changes
  - Settings updates
  - Schedule generation
  - Month/year selection
- **Data Structure**: JSON object containing array of schedules with metadata
- **Schedule Isolation**: Each schedule maintains its own employees, constraints, and generated assignments

#### 8.2 Data Recovery
- **App Launch**: Automatically loads saved schedule history from localStorage
- **Recovery Scope**:
  - Complete schedule history list
  - For each schedule: employee list with attributes, constraints, generated assignments
  - Global settings (shared across all schedules)
  - Last selected schedule
- **Error Handling**: Graceful degradation if localStorage is corrupted
- **Migration**: Handles data format updates for existing single-schedule data

---

## User Journey Examples

### Scenario 1: First-Time Manager Setting Up Multiple Monthly Schedules

1. **Setup Phase**:
   - Create first schedule for January 2025 using "Add Schedule" button
   - Add employees (e.g., 5 part-time workers) to January schedule
   - Set employee details (names, monthly shift capacity, tags)
   - Create second schedule for February 2025
   - Copy/recreate employee setup for February (or add new employees)

2. **Constraint Phase**:
   - Configure global rules (2 shifts/day, 2 people/shift, max 3 consecutive shifts)
   - Switch to January schedule and set employee preferences (John prefers weekends, Sarah avoids Fridays)
   - Switch to February schedule and adjust constraints based on different month needs

3. **Generation Phase**:
   - Generate January schedule, review assignments
   - Generate February schedule, review assignments
   - Export both schedules as CSV for payroll system

### Scenario 2: Ongoing Multi-Schedule Management

1. **Schedule Navigation**:
   - View schedule history list to see all existing schedules
   - Select specific month schedule to modify
   - Compare different month schedules side by side (by switching between them)

2. **Adjustment Phase**:
   - Select March schedule and modify employee availability based on requests
   - Update global constraints for seasonal changes
   - Add new temporary employees to specific month schedules

3. **Re-generation Phase**:
   - Regenerate affected schedules
   - Export updated schedules individually

### Scenario 3: Emergency Schedule Updates Across Multiple Months

1. **Quick Changes**:
   - Select current month schedule
   - Add avoid constraint for sick employee
   - Regenerate current month schedule to redistribute shifts
   - Check future month schedules and update if same employee has constraints
   - Export updated schedules immediately

### Scenario 4: Seasonal Schedule Planning

1. **Bulk Setup**:
   - Create schedules for entire quarter (Q2: April, May, June 2025)
   - Configure different employee pools for each month (seasonal workers)
   - Set month-specific constraints (vacation periods, holiday coverage)

2. **Comparative Planning**:
   - Generate all three schedules
   - Review distribution across months
   - Adjust constraints and regenerate as needed
   - Export complete quarterly schedule set

---

## Error Handling and Edge Cases

### Common Error Scenarios
- **No Schedules**: Attempting to access features without creating any schedules
- **Insufficient Staff**: Not enough shifts available to meet requirements in selected schedule
- **Impossible Constraints**: Conflicting constraints that cannot be satisfied in current schedule
- **No Employees**: Attempting to generate schedule without employees in selected schedule
- **Invalid Settings**: Configuration that creates unsolvable scheduling problems
- **Duplicate Schedule**: Attempting to create schedule for existing month/year combination

### User Feedback Mechanisms
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Visual indicators during processing
- **Validation Messages**: Clear error descriptions with suggested solutions
- **Success Confirmations**: Positive feedback for completed actions
- **Context Indicators**: Clear indication of which schedule is currently selected/active

### Data Integrity
- **Schedule Isolation**: Changes to one schedule don't affect others
- **Constraint Validation**: Prevents creation of impossible constraint combinations within each schedule
- **Automatic Cleanup**: Removes orphaned constraints when employees are deleted from specific schedules
- **Consistent State**: Ensures UI always reflects current data state for selected schedule
- **History Preservation**: Protects schedule history from accidental data loss

---

## Technical Implementation Notes

### State Management
- Custom React hooks for different concerns (schedule history, employee management, constraints, schedule generation)
- Centralized data management with localStorage persistence
- Multi-schedule data structure with individual schedule isolation
- Active schedule context management across components
- Optimistic UI updates with error rollback

### Performance Considerations
- Efficient algorithm for schedule generation per individual schedule
- Minimal re-renders through proper React optimization
- Local data storage for instant app startup
- Lazy loading of schedule data when switching between schedules

### User Experience Design
- Intuitive tab-based navigation with schedule history integration
- Progressive disclosure of features
- Clear visual indication of active/selected schedule
- Consistent visual feedback across all interactions
- Mobile-responsive design (implied by modern React architecture)
- Context-aware interface that adapts to selected schedule
