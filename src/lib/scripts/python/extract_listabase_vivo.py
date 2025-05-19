# EXTRAÇÃO DE NÚMEROS DE TELEFONE E CNPJ DO ARQUIVO CSV DA BASE VIVO (OS TELEFONES DE CADA CNPJ ESTÃO TODOS NA MESMA LINHA)
# Este script lê um arquivo CSV, extrai números de telefone e CNPJ, e grava os resultados em um novo arquivo CSV.

import csv
import re

# Arquivo de entrada e saída
arquivo_entrada = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\CNPJ E LINHAS VIVO - 2.csv'
arquivo_saida = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\saida.csv'

# Set para armazenar tuplas únicas
resultados = set()

# Expressão para extrair números de telefone
def extrair_numeros(texto):
    return re.findall(r'Linha:\s*(\d{10,11})', texto)

# Leitura do arquivo original
with open(arquivo_entrada, mode='r', encoding='utf-8-sig') as csvfile:
    leitor = csv.reader(csvfile, delimiter=';')
    next(leitor)  # Pula cabeçalho

    for linha in leitor:
        if len(linha) < 2:
            continue  # Pula linhas inválidas

        cnpj = linha[0].strip()
        observacoes = linha[1]

        numeros = extrair_numeros(observacoes)

        for numero in numeros:
            numero_formatado = numero[:10]  # Ex: 2199999999
            resultados.add((cnpj, numero_formatado))

# Escrita do novo CSV com separador ; para compatibilidade com Excel PT-BR
with open(arquivo_saida, mode='w', newline='', encoding='utf-8') as csvfile:
    escritor = csv.writer(csvfile, delimiter=';')  # <- AQUI está o segredo
    escritor.writerow(['CNPJ_CLIENTE', 'NR_TELEFONE'])

    for cnpj, numero in sorted(resultados):
        escritor.writerow([cnpj, numero])

print(f'Arquivo \"{arquivo_saida}\" gerado com sucesso e compatível com Excel PT-BR.')
