"""Comandos de linha de comando da aplicação (typer)."""

import typer

app = typer.Typer(help="Ferramentas de administração da Morada.")


@app.command()
def saudacao():
    """Saudação inicial do projeto."""
    print("Backend funcionando!")


def main():
    app()
