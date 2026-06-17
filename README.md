# Chat App

A real-time chat application built with modern web technologies, featuring instant messaging, room management, and user authentication.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time Communication**: Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Real-time Client**: Socket.IO Client

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Room Management**: Create group chats and 1-to-1 conversations
- **Message Status**: Track message status (sent, delivered, read)
- **Typing Indicators**: See when users are typing
- **Unread Message Tracking**: Track unread messages per room
- **Online Status**: See which users are online
- **Message Editing**: Edit sent messages
- **Message Deletion**: Delete messages
- **User Profiles**: User avatars and bios

## Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── types/          # TypeScript types
│   │   ├── app.ts          # Express app setup
│   │   ├── index.ts        # Server entry point
│   │   └── socket.ts       # Socket.IO setup
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── app/            # Next.js app router pages
    │   ├── components/     # React components
    │   ├── context/        # React context providers
    │   ├── hooks/          # Custom React hooks
    │   ├── lib/            # Utility functions
    │   ├── socket/         # Socket.IO client setup
    │   └── types/          # TypeScript types
    ├── public/
    ├── package.json
    └── .env.local
```

## Prerequisites

- Node.js 20 or higher
- MongoDB (local or cloud instance)
- npm or yarn

## Environment Variables

### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Installation

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## Docker Deployment

### Build Backend Docker Image

```bash
cd backend
docker build -t chat-app-backend .
```

### Run Backend Container

```bash
cd backend
docker run --env-file .env -p 5000:5000 chat-app-backend
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Rooms
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create a new room
- `PUT /api/rooms/:roomId` - Update room details
- `POST /api/rooms/1to1` - Get or create 1-to-1 room
- `POST /api/rooms/:roomId/members` - Add member to room
- `DELETE /api/rooms/:roomId/members/:userId` - Remove member from room
- `POST /api/rooms/:roomId/exit` - Exit group chat

### Messages
- `GET /api/messages/:roomId` - Get messages for a room

### Users
- `GET /api/users` - Search users

### Health Check
- `GET /health` - Server health check

## Socket.IO Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - Emit typing indicator
- `stop_typing` - Stop typing indicator
- `mark_read` - Mark message as read
- `message_delivered_receipt` - Confirm message delivery
- `edit_message` - Edit a message
- `delete_message` - Delete a message

### Server → Client
- `receive_message` - Receive a new message
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `message_read` - Message read confirmation
- `message_delivered` - Message delivered confirmation
- `message_updated` - Message updated
- `message_deleted` - Message deleted
- `user_connected` - User came online
- `user_offline` - User went offline
- `room_notification` - Room notification (unread count)
- `unread_count_updated` - Unread count updated

## Database Models

### User
- `username` (String, unique, required)
- `email` (String, unique, required)
- `password` (String, required)
- `isOnline` (Boolean, default: false)
- `bio` (String, max: 200)
- `avatar` (String)

### Room
- `name` (String, max: 100)
- `members` (Array of User references)
- `isGroup` (Boolean, default: true)
- `createdBy` (User reference)

### Message
- `roomId` (Room reference)
- `sender` (User reference)
- `content` (String, required, max: 2000)
- `status` (String enum: sending, sent, delivered, read)
- `isEdited` (Boolean, default: false)

### UnreadMessage
- `userId` (User reference)
- `roomId` (Room reference)
- `unreadCount` (Number)
- `lastMessageId` (Message reference)

## CI/CD

The project uses GitHub Actions for CI/CD:
- Runs on push and pull requests to main branch
- Type checks and builds the backend
- Uses Node.js 20 with npm caching

## Development Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run typecheck` - Type check without emitting files
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

ISC
