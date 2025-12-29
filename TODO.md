# TODO List for Implementing CAPTURE and PLAY Mode Logic and Code Refactoring

1. **Enhance CAPTURE Mode**:
   - Ensure timer starts from 00:00:00 and updates every second.
   - Display captured packets in real-time in the terminal (hex format).
   - File creation and saving logic is already implemented.
   - ✅ Completed: Added real-time display in packet processing.

2. **Enhance PLAY Mode**:
   - Start timer from 00:00:00 and update every second.
   - Load selected file and parse packets with timestamps.
   - Send packets at the saved times via UART.
   - Display decoded hex values in the terminal.
   - ✅ Completed: Implemented timed playback with packet sending and display.

3. **Update handleStart and handleStop for both modes**:
   - Modify to handle real-time display in CAPTURE.
   - Implement timed playback in PLAY mode.
   - ✅ Completed: Updated handleStart for both modes.

4. **Test the Updated Logic**:
   - Test CAPTURE: Start capture, verify real-time display, stop and check file download.
   - Test PLAY: Select file, start play, verify packets are sent at correct times and displayed.
   - ✅ App is running. User can test by connecting UART, switching modes, and verifying functionality.

5. **Refactor Code for Readability**:
   - Split large App.js into smaller, manageable files.
   - Create custom hooks for UART, device info, and capture/play logic.
   - Separate components into individual files.
   - ✅ Completed: Code refactored into multiple files for better organization and readability.
