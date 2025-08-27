# EXTRAÇÃO DE NÚMEROS DE TELEFONE E CNPJ DO ARQUIVO CSV DA BASE VIVO (OS TELEFONES DE CADA CNPJ ESTÃO TODOS NA MESMA LINHA SEPARADOS POR BARRA)
# Este script lê um arquivo CSV, extrai números de telefone e CNPJ, e grava os resultados em um novo arquivo CSV.

import csv
import re

# Arquivo de entrada e saída
arquivo_entrada = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\BANCO DE DADOS OUTROS PV - JULHO 2025.csv'
arquivo_saida = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\saida_BANCO DE DADOS OUTROS PV - JULHO 2025.csv'

# Set para armazenar tuplas únicas
resultados = set()

# Regex para validar números de telefone (10 ou 11 dígitos, começando com DDD)
regex_telefone = re.compile(r'^\d{10,11}$')

# Leitura do CSV no novo formato
with open(arquivo_entrada, mode='r', encoding='utf-8-sig') as csvfile:
    leitor = csv.reader(csvfile, delimiter=';')
    next(leitor)  # Pula o cabeçalho

    for linha in leitor:
        if len(linha) < 3:
            continue  # Ignora linhas incompletas

        cnpj = linha[0].strip()
        linha_principal = linha[1].strip()
        linhas_adicionais = linha[2].strip()

        # Adiciona a linha principal se válida
        if regex_telefone.match(linha_principal):
            resultados.add((cnpj, linha_principal))

        # Quebra as linhas adicionais por barra e valida
        for numero in linhas_adicionais.split('/'):
            numero = numero.strip()
            if regex_telefone.match(numero):
                resultados.add((cnpj, numero))

# Escrita do novo CSV com separador ; para compatibilidade com Excel PT-BR
with open(arquivo_saida, mode='w', newline='', encoding='utf-8') as csvfile:
    escritor = csv.writer(csvfile, delimiter=';')
    escritor.writerow(['CNPJ_CLIENTE', 'NR_TELEFONE'])

    for cnpj, numero in sorted(resultados):
        escritor.writerow([cnpj, numero])

print(f'Arquivo \"{arquivo_saida}\" gerado com sucesso e compatível com Excel PT-BR.')
