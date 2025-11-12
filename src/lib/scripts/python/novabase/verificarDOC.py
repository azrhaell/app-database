import os
import pandas as pd
from pathlib import Path

def validar_cpf(cpf):
    """Valida CPF através do cálculo dos dígitos verificadores"""
    # Remove caracteres não numéricos e pega apenas os dígitos
    cpf = ''.join(filter(str.isdigit, str(cpf)))
    
    # CPF deve ter 11 dígitos
    if len(cpf) != 11:
        return False
    
    # Verifica se todos os dígitos são iguais (CPF inválido)
    if cpf == cpf[0] * 11:
        return False
    
    # Calcula o primeiro dígito verificador
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    
    # Verifica o primeiro dígito
    if int(cpf[9]) != digito1:
        return False
    
    # Calcula o segundo dígito verificador
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    
    # Verifica o segundo dígito
    return int(cpf[10]) == digito2

def validar_cnpj(cnpj):
    """Valida CNPJ através do cálculo dos dígitos verificadores"""
    # Remove caracteres não numéricos
    cnpj = ''.join(filter(str.isdigit, str(cnpj)))
    
    # CNPJ deve ter 14 dígitos
    if len(cnpj) != 14:
        return False
    
    # Verifica se todos os dígitos são iguais (CNPJ inválido)
    if cnpj == cnpj[0] * 14:
        return False
    
    # Calcula o primeiro dígito verificador
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * pesos1[i] for i in range(12))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    
    # Verifica o primeiro dígito
    if int(cnpj[12]) != digito1:
        return False
    
    # Calcula o segundo dígito verificador
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * pesos2[i] for i in range(13))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    
    # Verifica o segundo dígito
    return int(cnpj[13]) == digito2

def identificar_documento(doc):
    """Identifica se o documento é CPF ou CNPJ válido"""
    # Garante que doc seja string
    doc_str = str(doc).strip()
    
    # Remove caracteres não numéricos
    doc_numeros = ''.join(filter(str.isdigit, doc_str))
    
    # Se o documento tem 14 caracteres, verifica os últimos 11 para CPF
    if len(doc_numeros) == 14:
        # Tenta validar como CNPJ primeiro (todos os 14 dígitos)
        if validar_cnpj(doc_numeros):
            return 'CNPJ'
        
        # Tenta validar como CPF (últimos 11 dígitos)
        cpf_11_digitos = doc_numeros[-11:]
        if validar_cpf(cpf_11_digitos):
            return 'CPF'
    
    # Se tem 11 dígitos, valida como CPF
    elif len(doc_numeros) == 11:
        if validar_cpf(doc_numeros):
            return 'CPF'
    
    return 'INVÁLIDO'

def processar_csvs(pasta):
    """Processa todos os arquivos CSV da pasta"""
    pasta_path = Path(pasta)
    
    if not pasta_path.exists():
        print(f"Erro: A pasta '{pasta}' não existe!")
        return
    
    # Lista todos os arquivos CSV na pasta
    arquivos_csv = list(pasta_path.glob('*.csv'))
    
    if not arquivos_csv:
        print(f"Nenhum arquivo CSV encontrado na pasta '{pasta}'")
        return
    
    print(f"Encontrados {len(arquivos_csv)} arquivo(s) CSV\n")
    
    # Processa cada arquivo CSV
    for arquivo in arquivos_csv:
        print(f"Processando: {arquivo.name}")
        
        try:
            # Lê o CSV com separador ponto e vírgula
            df = pd.read_csv(arquivo, sep=';', dtype=str, encoding='latin-1')
            
            # Verifica se a coluna DOC existe
            if 'DOC' not in df.columns:
                print(f"  [AVISO] Coluna 'DOC' nao encontrada em {arquivo.name}")
                continue
            
            # Adiciona coluna com tipo de documento validado
            df['TIPO_DOC_VALIDADO'] = df['DOC'].apply(identificar_documento)
            
            # Estatísticas
            total = len(df)
            cpf_validos = (df['TIPO_DOC_VALIDADO'] == 'CPF').sum()
            cnpj_validos = (df['TIPO_DOC_VALIDADO'] == 'CNPJ').sum()
            invalidos = (df['TIPO_DOC_VALIDADO'] == 'INVÁLIDO').sum()
            
            print(f"  Total de registros: {total}")
            print(f"  CPF válidos: {cpf_validos}")
            print(f"  CNPJ válidos: {cnpj_validos}")
            print(f"  Inválidos: {invalidos}")
            
            # Salva o arquivo processado
            nome_saida = arquivo.stem + '_validado.csv'
            caminho_saida = pasta_path / nome_saida
            df.to_csv(caminho_saida, sep=';', index=False, encoding='latin-1')
            print(f"  [OK] Arquivo salvo: {nome_saida}\n")
            
        except Exception as e:
            print(f"  [ERRO] Erro ao processar {arquivo.name}: {str(e)}\n")

# Caminho da pasta
#pasta_csv = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\PJ"
pasta_csv = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\B2C"

# Processa os arquivos
processar_csvs(pasta_csv)