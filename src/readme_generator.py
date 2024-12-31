"""
Automated README Generator for FES Platform
Generates dynamic project documentation with real-time insights
"""

import os
import re
from datetime import datetime
from typing import Dict, List, Any
import json
from pathlib import Path

class ReadmeGenerator:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.metrics = {}
        
    def gather_project_metrics(self) -> Dict[str, Any]:
        """
        Gather key project metrics and insights
        """
        metrics = {
            "last_updated": datetime.now().isoformat(),
            "total_files": 0,
            "code_files": 0,
            "total_lines": 0,
            "languages": {},
            "components": {
                "frontend": 0,
                "backend": 0,
                "tests": 0
            }
        }
        
        for root, _, files in os.walk(self.project_root):
            if "node_modules" in root or ".git" in root:
                continue
                
            for file in files:
                if file.startswith("."):
                    continue
                    
                file_path = Path(root) / file
                metrics["total_files"] += 1
                
                # Count by file type
                ext = file.split(".")[-1].lower()
                if ext in ["py", "ts", "tsx", "js", "jsx"]:
                    metrics["code_files"] += 1
                    metrics["languages"][ext] = metrics["languages"].get(ext, 0) + 1
                    
                    # Count lines
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            line_count = sum(1 for _ in f)
                            metrics["total_lines"] += line_count
                            
                        # Categorize components
                        rel_path = str(file_path.relative_to(self.project_root))
                        if rel_path.startswith(("client/", "src/components")):
                            metrics["components"]["frontend"] += 1
                        elif rel_path.startswith(("server/", "src/")):
                            metrics["components"]["backend"] += 1
                        elif rel_path.startswith("tests/"):
                            metrics["components"]["tests"] += 1
                    except:
                        continue
                        
        self.metrics = metrics
        return metrics
        
    def generate_readme(self) -> str:
        """
        Generate README content with project insights
        """
        metrics = self.gather_project_metrics()
        
        # Format language distribution
        lang_dist = "\n".join([
            f"- {lang.upper()}: {count} files"
            for lang, count in metrics["languages"].items()
        ])
        
        readme_template = f"""# Fluctuation-Enhanced Sensing (FES) Platform

A cutting-edge cyber warfare and threat detection system leveraging advanced signal processing and machine learning techniques for real-time anomaly detection and threat analysis.

## Project Overview

The FES platform provides military and security agencies with comprehensive cyber intelligence capabilities through:
- Real-time anomaly detection using fluctuation-enhanced sensing
- Advanced signal correlation for threat attribution
- Machine learning-powered predictive analytics
- Dynamic threat visualization and mapping
- Secure IoT sensor integration

## Project Insights
*Last updated: {datetime.fromisoformat(metrics['last_updated']).strftime('%Y-%m-%d %H:%M:%S')}*

### Codebase Statistics
- Total Files: {metrics['total_files']}
- Code Files: {metrics['code_files']}
- Total Lines of Code: {metrics['total_lines']}

### Language Distribution
{lang_dist}

### Component Distribution
- Frontend Components: {metrics['components']['frontend']}
- Backend Services: {metrics['components']['backend']}
- Test Files: {metrics['components']['tests']}

## Core Features

### Core Capabilities
- **Advanced Anomaly Detection**: Utilizes fluctuation-enhanced techniques to detect subtle irregularities in network traffic and system behavior
- **Real-time Threat Analysis**: Processes and analyzes signals in real-time from distributed IoT sensors
- **Machine Learning Integration**: Employs sophisticated ML models for pattern recognition and threat prediction
- **Command Center Interface**: Military-grade dark mode UI optimized for 24/7 operations
- **Global Threat Mapping**: Interactive visualization of threat origins and progression

### Security Features
- Role-based access control with secure authentication
- End-to-end encryption for all data transmissions
- Real-time monitoring of system integrity
- Comprehensive audit logging

## Technology Stack

### Frontend
- React with TypeScript
- D3.js for data visualization
- Tailwind CSS for styling
- WebSocket for real-time updates

### Backend
- Node.js Express server for API gateway
- Python Flask for signal processing
- PostgreSQL for data persistence
- WebSocket server for real-time communication

### Signal Processing
- NumPy and SciPy for advanced signal analysis
- Custom fluctuation-enhanced sensing algorithms
- Wavelet transform for multi-scale analysis
- FFT for frequency domain analysis

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database

### Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd fes-platform
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
pip install -r requirements.txt
\`\`\`

3. Set up environment variables:
\`\`\`bash
# Database configuration
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]

# Server configuration
PORT=5000
PYTHON_SERVICE_PORT=5001
\`\`\`

4. Start the development servers:
\`\`\`bash
npm run dev
\`\`\`

## Security Considerations

- All authentication endpoints use secure session management
- Signal data is validated before processing
- Database queries are protected against SQL injection
- WebSocket connections require authentication
- Regular security audits recommended

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Military and security agencies for requirements guidance
- Open-source community for various tools and libraries
- Research papers on fluctuation-enhanced sensing techniques

---

For more detailed documentation, please refer to the \`/docs\` directory.

**Note**: This is a security-sensitive application. Please follow all security protocols and guidelines when deploying in production environments.
"""
        return readme_template
        
    def update_readme(self) -> None:
        """
        Update the README.md file with latest metrics
        """
        readme_content = self.generate_readme()
        readme_path = self.project_root / "README.md"
        
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme_content)
            
    def export_metrics(self, output_path: str) -> None:
        """
        Export metrics to JSON for external use
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.metrics, f, indent=2)

def update_project_readme():
    """
    Update the project README with latest metrics
    """
    generator = ReadmeGenerator(os.getcwd())
    generator.update_readme()
    
if __name__ == "__main__":
    update_project_readme()
