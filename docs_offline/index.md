
# 🔐 FES - Field Extraction System

The **Field Extraction System (FES)** is a cross-platform automation and threat intelligence framework designed for covert data collection, threat analysis, and field-based cyber-physical operations. It integrates AI-driven insights, real-time dashboards, and customizable automation modules.

---

## 🚀 Features

- 🌐 Cloudflare-secured operation automation
- 📊 Live dashboards with threat visualization
- ⚙️ Modular architecture: automation, signal processing, and alerting
- 🧠 AI-assisted decision-making tools
- 🔄 CI/CD ready and containerized with Docker
- ✅ Supports AppImage (.app), .deb, and .exe packaging

---

## 🖥️ Supported Platforms

| OS         | CLI Support | GUI Support | Portable |
|------------|-------------|-------------|----------|
| Ubuntu     | ✅          | ✅          | ✅ (.AppImage) |
| Windows    | ✅          | ✅          | ✅ (.exe)      |
| macOS      | ✅          | ✅          | ✅ (.pkg)      |

---

## 🧩 Installation

### 🐳 Docker
```bash
docker build -t fes-system ./docker
docker run -it fes-system
```

### 🧾 Linux (.deb)
```bash
sudo dpkg -i fes-installer.deb
```

### 📦 AppImage
```bash
chmod +x fes.AppImage
./fes.AppImage
```

### 🪟 Windows (.exe)
Download from [Releases](https://github.com/rfc391/FES/releases) and double-click installer.

---

## 💡 Usage

### CLI Mode
```bash
python3 src/main.py --mode auto --config config/config.yaml
```

### GUI Mode
Launch via:
```bash
python3 src/gui_launcher.py
```

---

## 📁 Folder Structure

- `src/`: Entry points and core control logic
- `core/`: AI, processing, and automation brains
- `scripts/`: Automation & orchestration tools
- `config/`: YAMLs, Dockerfiles, and templates
- `frontend/`: GUI components (React, Dart)
- `docs/`: Setup, usage, and architecture guides

---

## 🧪 Testing

```bash
pytest tests/
```

---

## 🛠️ Contributing

See [CONTRIBUTING.md](docs/developer_guide.md). We welcome PRs, Issues, and Discussions.

---

## 🔒 Security

Vulnerabilities? Please report securely via GPG:
- Email: robshubert96@gmail.com
- GPG Key: `gpg --recv-keys <FES_KEY_ID>`

---

## 🧠 Intelligence + Innovation = Apex Security
Developed and maintained by [Apex Security Int Ltd](https://apexsecurityint.com)
