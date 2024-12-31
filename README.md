
# Automated Project Management & Testing Suite

## Features
- Automated testing and code quality checks
- Trello project management automation
- Workflow visualization
- Signal processing and analysis
- Threat detection and monitoring
- Mobile app integration

## Setup
1. Set required environment variables in Replit Secrets:
   - TRELLO_API_KEY
   - TRELLO_API_TOKEN
   - EMAIL_USER
   - EMAIL_PASS
   - WEBHOOK_URL

2. Install dependencies:
```bash
npm install
pip install -r requirements.txt
```

3. Start the services:
```bash
python start_all.py
```

## Components
- Web Dashboard (/client)
- Test Runner (/src/automation)
- Trello Integration (/src/trello_automation)
- Signal Processing (/src/signal_processing)
- Mobile App (/mobile_app)

## Testing
Run all tests:
```bash
python tests/run_all_tests.py
```
