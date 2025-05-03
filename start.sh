#!/bin/bash

# Function to handle cleanup
cleanup() {
    echo "Shutting down servers..."
    # kill $(jobs -p) kills all background processes started by this script
    # 2>/dev/null suppresses error messages if no processes are found
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up trap for cleanup on script termination
# trap 'command' SIGNAL means run 'command' when SIGNAL is received
# SIGINT is Ctrl+C, SIGTERM is termination signal
trap cleanup SIGINT SIGTERM

# Start the Flask server
cd server
python ./run.py &  # & runs the process in background
SERVER_PID=$!      # $! stores the PID of the last background process

# Start the Vite dev server
cd ../client
npm run dev &      # & runs the process in background
CLIENT_PID=$!      # $! stores the PID of the last background process

# Keep script running and show logs
tail -f /dev/null &  # Creates a dummy process that keeps running
TAIL_PID=$!          # Store its PID

# Wait for tail process
wait $TAIL_PID      # Keeps script running until tail is killed
