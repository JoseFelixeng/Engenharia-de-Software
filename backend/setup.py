import io 
import os 
from setuptools import find_packages, setup

def read(*paths, **kwargs):
    with io.open(
        os.path.join(os.path.dirname(__file__), *paths),
        encoding=kwargs.get("encoding", "utf8")
    ) as open_file:
        return open_file.read().strip()
def read_requirements(path):
    return [
        line.strip()
        for line in read(path).split("\\n")
        if line and not line.startswith(("#", "-", "git+"))
    ]

# Meta dados do projeto
setup(S
    name="backend",
    version="0.0.1",
    description="Backend de uma aplicação de venda de imovéis",
    long_description=read("README.md"),
    long_description_content_type="text/markdown",
    url="<https://backend.io>",
    author="José Felix/ Grupo de Enbarcados",
    python_requires=">=3.8",
    packages=find_packages(exclude=["tests"]),
    include_package_data=True,
    install_requires=read_requirements("requirements-dev.txt"),
    entry_points={
        "console_scripts": ["backend = backend.cli:main"]
    },
)