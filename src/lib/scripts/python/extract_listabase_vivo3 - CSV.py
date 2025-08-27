# EXTRAÇÃO DE NÚMEROS DE TELEFONE,RAZAO SOCIAL E CNPJ DO ARQUIVO CSV DA BASE VIVO (OS TELEFONES DE CADA CNPJ ESTÃO TODOS NA MESMA LINHA, MAS EM COLUNAS DIFERENTES)
# Este script lê um arquivo CSV, extrai números de telefone, Razao Social e CNPJ, e grava os resultados em um novo arquivo CSV.

#FORMATADO PARA A NOVA BASE DE DADOS VIVO - [CNPJ_CLIENTE;CLIENTE;NR_TELEFONE;OPERADORA]

import pandas as pd

# Caminho do arquivo de entrada
caminho_entrada = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\ATUALIZAÇÃO LINHAS E CNPJS VIVO - 25 05 2025.csv'

# Caminho do arquivo de saída
caminho_saida = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\BaseVivo3.csv'

# Lê o CSV de entrada (separador ;)
df = pd.read_csv(caminho_entrada, sep=';', dtype=str)

# Remove duplicatas baseadas em CNPJ, Cliente e Telefone
df_unico = df.drop_duplicates(subset=['CNPJ_CLIENTE', 'CLIENTE', 'NR_TELEFONE'])

# Renomeia colunas se necessário (opcional)
df_unico = df_unico.rename(columns={
    'CNPJ_CLIENTE': 'CNPJ_CLIENTE',
    'CLIENTE': 'RAZAO_SOCIAL',
    'NR_TELEFONE': 'NR_TELEFONE',
    'OPERADORA': 'OPERADORA'
})

# Salva no formato CSV com separador ;
df_unico.to_csv(caminho_saida, sep=';', index=False)
