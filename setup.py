
from setuptools import setup, find_packages

setup(
    name="FES_Project",
    version="0.1",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "numpy",
        "scipy",
        "matplotlib",
        "seaborn",
        "scikit-learn",
        "PyQt5",
        "requests",
        "yagmail",
        "schedule",
        "pytest"
    ],
    description="Fluctuation-Enhanced Sensing Project",
    author="rfc391",
    license="MIT",
)
