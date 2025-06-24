import pandas as pd
import re

# Regex para validar e-mails
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

def validar_email(email: str) -> bool:
    if not isinstance(email, str):
        return False
    email = email.strip()
    if email == "":
        return False
    if " " in email:
        return False
    if not EMAIL_REGEX.match(email):
        return False
    return True

def verificar_emails_xlsx(caminho_arquivo: str):
    # Lê o arquivo XLSX
    df = pd.read_excel(caminho_arquivo, engine='openpyxl')

    # Verifica se as colunas obrigatórias existem
    colunas_necessarias = {'CNPJ', 'CLIENTE', 'E-MAIL'}
    if not colunas_necessarias.issubset(df.columns):
        raise ValueError(f"Arquivo deve conter as colunas: {colunas_necessarias}")

    # Cria uma nova coluna com o resultado da validação
    df['EMAIL_VALIDO'] = df['E-MAIL'].apply(validar_email)

    # Filtra os registros com e-mail inválido
    emails_invalidos = df[df['EMAIL_VALIDO'] == False]

    # Exibe os resultados
    if not emails_invalidos.empty:
        print("Registros com e-mails inválidos:")
        print(emails_invalidos[['CNPJ', 'CLIENTE', 'E-MAIL']])
    else:
        print("Todos os e-mails são válidos.")

    # Retorna os registros inválidos se quiser usar depois
    return emails_invalidos

# Exemplo de uso
caminho = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\E-MAIL MKT VIVO TECH - LINK DEDICADO - JUNHO 2025.xlsx'  # Substitua pelo caminho do seu arquivo
verificar_emails_xlsx(caminho)
