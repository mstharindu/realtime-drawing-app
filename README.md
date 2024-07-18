# Realtime Collaborative Drawing App

![App Screenshot](https://github.com/mstharindu/realtime-drawing-app/blob/master/client/public/sample.gif)

## Overview

This project is a realtime collaborative drawing app where users can create, move, scale, rotate, change color, and delete rectangles.

## Features

- **Realtime Collaboration**: Multiple users can draw and manipulate rectangles simultaneously.
- **Undo/Redo System**: An undo/redo functionality based on the command pattern.
- **Emulator Functions**: Simulates dummy user activities for testing and demonstration purposes.
- **Dockerized**: All components run in Docker containers managed by Docker Compose.

## Tech Stack

- **Frontend**: React
- **Backend**: Express.js
- **Realtime Communication**: Socket.io
- **Database**: RethinkDB
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Docker
- Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mstharindu/realtime-drawing-app.git
   cd realtime-drawing-app

2. **Build and start Docker containers**
   ```bash
   docker-compose up --build

3. **Access the app**
   Open your browser and navigate to http://localhost:3000
