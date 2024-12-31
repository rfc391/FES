
from setuptools import setup, find_packages

setup(
    name="project_name",
    version="0.1",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "numpy",
        "pandas",
        "matplotlib",
        "pytest"
    ],
    description="Project description",
    author="Your Name",
    license="MIT",
)
