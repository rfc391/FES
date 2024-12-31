# Cyber Threat Detection Platform

A state-of-the-art security monitoring and threat intelligence sharing platform designed for security professionals. Built with modern web technologies and machine learning capabilities to provide comprehensive security insights and collaborative threat detection.

## Features

### 🛡️ Real-time Threat Detection Dashboard
- Live monitoring of security threats and anomalies
- Interactive threat visualization with severity indicators
- Real-time WebSocket updates for immediate threat alerts
- Historical threat analysis and trending data

### 🔄 Threat Intelligence Sharing
- Collaborative threat intelligence dashboard
- Share and receive threat indicators across organizations
- Verify and validate shared intelligence
- Track confidence scores and reliability metrics

### 🔔 Multi-Channel Alert Notifications
- Customizable notification preferences
- Support for email, webhook, and in-app notifications
- Priority-based alert filtering
- Quiet hours and digest frequency settings
- Real-time and batch notification options

### 🎯 Security Recommendations
- One-click secure configuration implementation
- Priority-based recommendation system
- Automated security posture assessment
- Implementation verification and tracking
- Impact analysis for each recommendation

### 🌐 Security Professional Network
- Connect with security experts
- Share insights and best practices
- Comment and discuss threat intelligence
- Follow experts and trending topics
- Real-time threat discussions

### 🌙 Dark Mode with Security Theme
- High-contrast security-focused design
- Professional dark theme optimized for security operations
- Customizable color schemes for threat severity
- Accessibility-compliant interface

## Technical Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for live updates
- **Authentication**: Passport.js
- **API**: RESTful with TypeScript types

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd cyber-threat-platform
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]
\`\`\`

4. Initialize the database:
\`\`\`bash
npm run db:push
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:5000`

## API Documentation

### Authentication
- POST `/api/login` - User login
- POST `/api/register` - New user registration
- POST `/api/logout` - User logout

### Threat Intelligence
- GET `/api/threats` - Get latest threats
- POST `/api/threats` - Report new threat
- GET `/api/threat-intelligence` - Get shared intelligence
- POST `/api/threat-intelligence/{id}/share` - Share intelligence

### Security Recommendations
- GET `/api/security/recommendations` - Get security recommendations
- POST `/api/security/recommendations/{id}/apply` - Apply recommendation

### Notifications
- GET `/api/notifications/preferences` - Get notification settings
- POST `/api/notifications/preferences` - Update notification preferences

### Social Network
- GET `/api/social/posts` - Get threat discussion posts
- POST `/api/social/posts` - Create new post
- POST `/api/social/posts/{id}/like` - Like/unlike post

## Development Guidelines

1. **Code Style**
   - Use TypeScript for type safety
   - Follow ESLint configuration
   - Use Prettier for code formatting

2. **Git Workflow**
   - Create feature branches from `main`
   - Use conventional commits
   - Submit PRs for review

3. **Testing**
   - Write unit tests for new features
   - Ensure E2E test coverage
   - Run `npm test` before commits

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.