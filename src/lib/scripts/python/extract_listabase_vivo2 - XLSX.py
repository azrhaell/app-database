# EXTRAÇÃO DE NÚMEROS DE TELEFONE,RAZAO SOCIAL E CNPJ DO ARQUIVO XLSX DA BASE VIVO
# Este script lê um arquivo XLSX, extrai números de telefone, Razao Social e CNPJ, e grava os resultados em um novo arquivo CSV.

# É necessário instalar a biblioteca openpyxl para ler arquivos XLSX:
# pip install openpyxl

#FORMATADO PARA A NOVA BASE DE DADOS VIVO - [CNPJ;NOME ORGANIZACAO;LINHA PRINCIPAL;LINHA 1;LINHA 2;LINHA 3;LINHA 4;LINHA 5]

import pandas as pd


# Caminho do arquivo de entrada (agora no formato .xlsx)
caminho_entrada = r'd:\Github\Vivo_Database\app-database\public\MISC\BASE VIVO 21082025\ATUALIZACAO BANDO DE DADOS TC - LINHAS VIVO TC TELECOM - AGOSTO 2025.xlsx'

# Caminho do arquivo de saída
caminho_saida = r'd:\Github\Vivo_Database\app-database\public\MISC\ATUALIZACAO BANDO DE DADOS TC - LINHAS VIVO TC TELECOM - AGOSTO 2025.csv'

# Lê o arquivo XLSX de entrada
# A função read_excel é usada para ler arquivos .xlsx
df = pd.read_excel(caminho_entrada, dtype=str)

# Lista para armazenar as linhas transformadas
linhas_saida = []

# Percorre cada linha da tabela
for _, row in df.iterrows():
    cnpj = row['CNPJ_CLIENTE']
    # razao_social = row['NOME ORGANIZACAO']

    # Coleta todos os telefones (ignorando campos vazios)
    telefones = [row[col] for col in row.index if 'CELULAR' in col and pd.notna(row[col]) and row[col].strip() != '']

    # Remove duplicatas mantendo a ordem
    telefones_unicos = list(dict.fromkeys(telefones))

    # Cria uma nova linha para cada telefone
    for telefone in telefones_unicos:
        linhas_saida.append({
            'CNPJ_CLIENTE': cnpj,
            #'RAZAO_SOCIAL': razao_social,
            'NR_TELEFONE': telefone
        })

# Converte para DataFrame
df_saida = pd.DataFrame(linhas_saida)

# Salva no formato CSV com separador ;
df_saida.to_csv(caminho_saida, sep=';', index=False)
