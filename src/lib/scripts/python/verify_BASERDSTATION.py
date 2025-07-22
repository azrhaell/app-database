import pandas as pd
import re
import os

# Regex para validar e-mails
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

def validar_email(email: str) -> bool:
    try:
        email = str(email).strip()
        if email == "" or " " in email:
            return False
        return bool(EMAIL_REGEX.match(email))
    except:
        return False

def verificar_emails_xlsx(caminho_arquivo: str, salvar_em: str = None):
    # Lê o arquivo XLSX
    df = pd.read_excel(caminho_arquivo, engine='openpyxl')

    # Limpa espaços nos nomes das colunas
    df.columns = df.columns.str.strip()

    # Verifica se as colunas obrigatórias existem
    colunas_necessarias = {'CNPJ', 'Razao', 'EMAIL1'}
    if not colunas_necessarias.issubset(df.columns):
        raise ValueError(f"Arquivo deve conter as colunas: {colunas_necessarias}")

    # Aplica validação
    df['EMAIL_VALIDO'] = df['EMAIL1'].apply(validar_email)

    # Mostra inválidos
    emails_invalidos = df[~df['EMAIL_VALIDO']]
    if not emails_invalidos.empty:
        print("\nRegistros com e-mails inválidos:")
        print(emails_invalidos[['CNPJ', 'Razao', 'EMAIL1']])
    else:
        print("\nTodos os e-mails são válidos.")

    # Remove inválidos
    df_validos = df[df['EMAIL_VALIDO']].drop(columns=['EMAIL_VALIDO'])

    # Define o caminho de salvamento
    if not salvar_em:
        pasta, nome_arquivo = os.path.split(caminho_arquivo)
        nome_base = os.path.splitext(nome_arquivo)[0]
        salvar_em = os.path.join(pasta, f'{nome_base}_validos.xlsx')

    # Salva em novo arquivo
    df_validos.to_excel(salvar_em, index=False)
    print(f"\nArquivo salvo com e-mails válidos em:\n{salvar_em}")

    return df_validos

# Exemplo de uso
caminho = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\E-MAIL MKT - GUD - BASE 15 JULHO 2025.xlsx'
verificar_emails_xlsx(caminho)
